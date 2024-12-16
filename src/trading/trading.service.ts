import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateTradingDto } from "./dto/create-trading.dto";
import { UpdateTradingDto } from "./dto/update-trading.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationService } from "src/pagination/pagination.service";
import { Prisma, Transactions } from "@prisma/client";
import { TransactionResponse } from "./type/TransactionResponse";
import { SoftDeleteDto } from "./dto/SoftDelete.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { join } from "path";
import { fileURLToPath } from "url";
import { createObjectCsvWriter } from "csv-writer";
import * as ExcelJS from "exceljs";
import { Buffer } from "buffer";

@Injectable()
export class TradingService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<TransactionResponse>,
    private mailerService: MailerService
  ) {}

  async create(createTradingDto: CreateTradingDto, user: any) {
    try {
      const { cartRows, ...rest } = createTradingDto;
      const exchangerate = await this.prisma.exchangeRate.findFirst({
        where: { id: +rest.select_currency },
      });
      const latest_transaction = await this.prisma.transactions.findFirst({
        orderBy: {
          invoice_num: "desc",
        },
      });
      let new_invoice_num = latest_transaction
        ? latest_transaction.invoice_num + 1
        : 400000 + 1;
      // Start a database transaction

      const data = await this.prisma.$transaction(
        async (prisma) => {
          let customer = null;
          let customerData = null;
          if (rest.customer || (rest.first_name && rest.last_name)) {
            const customerData = await this.prisma.customer.findUnique({
              where: { id: +rest.customer },
            });
            customer = customerData;
            if (!customerData) {
              customer = await prisma.customer.create({
                data: {
                  customer: rest.customer,
                  first_name: rest.first_name,
                  last_name: rest.last_name,
                  dob: rest.dob,
                  id_type: rest.id_type,
                  id_number: rest.id_number,
                  expiry_date: rest.expiry_date,
                  place_of_issue: rest.place_of_issue,
                  phone: rest.phone,
                  address: rest.address,
                  city: rest.city,
                  province: rest.province,
                  postal_code: rest.postal_code,
                  occupation: rest.occupation,
                  business_phone: rest.business_phone,
                },
              });
            }
          }

          const transaction_result = await prisma.transactions.create({
            data: {
              customerId: customer ? customer.id : null,
              country: exchangerate.country,
              country_id: exchangerate.id,
              invoice_num: new_invoice_num,
              pay_in: rest.pay_in,
              currency: rest.currency,
              code: rest.code,
              we_buy: +rest.we_buy,
              we_sell: +rest.we_sell,
              cash: +rest.cash ?? 0.0,
              interac: +rest.interac ?? 0.0,
              money_order: +rest.money_order ?? 0.0,
              transaction_type: rest.checkbox_we_buy ? "Purchase" : "Sale",
              other_reasons: rest.other_reasons,
              unusual_behaviour: rest.unusual_behaviour,
              hesitate_to_provide_id: rest.hesitate_to_provide_id,
              uncommon_question: rest.uncommon_question,
              frequent_transaction: rest.frequent_transaction,
              red_flag: rest.red_flag,
              change: +rest.change ?? 0.0,
            },
          });
          const cartRowData = cartRows.map((cartrow) => ({
            transactionId: transaction_result.id,
            currency: cartrow.currency,
            currency_amount: cartrow.input_amount,
            total: cartrow.total,
            pay_in: transaction_result.pay_in,
            exchange_rate_id: cartrow.exchange_rate_id,
            rate: cartrow.rate,
            code: cartrow.code,
          }));

          // Calculate the total amount from cartRowData
          const totalAmount = cartRowData.reduce(
            (acc, cartrow) => acc + cartrow.total,
            0
          );

          // Update transaction_result with the total amount
          transaction_result.total = totalAmount;

          // Now, update the transaction in the database
          await prisma.transactions.update({
            where: { id: transaction_result.id },
            data: {
              total: totalAmount,
            },
          });

          await prisma.transactionCart.createMany({
            data: cartRowData,
          });
          // for (const cartrow of cartRows) {
          //   await prisma.transactionCart.create({
          //     data: {
          //       transactionId: transaction_result.id,
          //       currency: cartrow.currency,
          //       currency_amount: cartrow.input_amount,
          //       total: cartrow.total,
          //       pay_in: transaction_result.pay_in,
          //       exchange_rate_id: cartrow.exchange_rate_id,
          //       rate: cartrow.rate,
          //       code: cartrow.code,
          //     },
          //   });
          // }

          const transactionWithCart = await prisma.transactions.findUnique({
            where: { id: transaction_result.id },
            include: {
              carts: true,
            },
          });

          this.addInventory(
            transactionWithCart,
            user,
            transaction_result.transaction_type
          );

          return transactionWithCart;
        },
        {
          timeout: 10000,
        }
      );

      const cartTotal = data.carts.reduce((acc, cart) => acc + cart.total, 0);

      // Check for email sending conditions
      if (cartTotal >= 3000) {
        const setting = await this.prisma.setting.findFirst();
        try {
          var response = await this.mailerService.sendMail({
            to: setting.email,
            from: "order@uexchange.ca",
            subject: "Plain Text Email ✔",
            text: "Welcome multiple transaction",
          });
        } catch (emailError) {
          if (emailError.code === "EENVELOPE") {
            throw new InternalServerErrorException("Invalid email envelope");
            console.error("Invalid email envelope:", emailError.message);
          } else if (emailError.code === "EAUTH") {
            throw new InternalServerErrorException(
              "Authentication error:Invalid credentials for email"
            );
            console.error("Authentication error:", emailError.message);
          } else {
            throw new InternalServerErrorException("Error sending email");
            console.error("Error sending email:", emailError);
          }
          // Handle email sending error
          console.error("Error sending email:", emailError);

          // Here, we re-throw the error so it propagates up the call stack,
          // and the database transaction gets rolled back as well.
          throw new InternalServerErrorException(emailError.message);
        }
      }

      return data;
    } catch (dbError) {
      // Handle database transaction error
      console.error("Error during database transaction:", dbError);

      // Here, we re-throw the error so it propagates up the call stack,
      // and the database transaction gets rolled back.
      throw new InternalServerErrorException(dbError.message);
    }
  }
  async findAll(
    page?: number,
    pageSize?: number
  ): Promise<PaginationResponse<TransactionResponse>> {
    try {
      let skip;
      let take;
      if (page !== undefined && pageSize !== undefined) {
        skip = (page - 1) * pageSize;
        take = Number(pageSize);
      }

      const transactions = await this.prisma.transactions.findMany({
        skip,
        take,
        include: {
          carts: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const totalItems = await this.prisma.transactions.count();

      if (page !== undefined && pageSize !== undefined) {
        return this.paginationService.getPaginationData(
          page,
          pageSize,
          transactions,
          totalItems
        );
      } else {
        return {
          items: transactions,
          page: page,
          totalPages: 0,
          pageSize: pageSize,
          totalItems: totalItems,
          hasPrevious: false,
          hasNext: false,
        };
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while fetching the transactions"
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} trading`;
  }

  update(id: number, updateTradingDto: UpdateTradingDto) {
    return `This action updates a #${id} trading`;
  }

  remove(id: number) {
    return `This action removes a #${id} trading`;
  }

  async softDelete(softDeleteDto: SoftDeleteDto) {
    const updatedData = await this.prisma.transactions.update({
      where: { id: softDeleteDto.transactionId },
      data: { delete_message: softDeleteDto.message, deleteStatus: true },
    });
    return "transaction have been deleted";
  }

  async addInventory(transactionWithCart, user, type) {
    console.log("type", type);
    if (transactionWithCart) {
      for (const cart of transactionWithCart.carts) {
        // Fetch the inventory based on the currency code i.e exchange_rate_id
        const inventory = await this.prisma.inventory.findFirst({
          where: {
            currency_code: cart.exchange_rate_id,
            location: user.officeId,
          },
        });
        console.log(inventory);
        if (inventory) {
          // Update the inventory fields as needed
          console.log(cart.currency_amount);
          const updatedInventory = await this.prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              amount:
                type === "Purchase"
                  ? inventory.amount + cart.currency_amount
                  : inventory.amount - cart.currency_amount,
            },
          });
          console.log("update", updatedInventory);
        } else {
          console.log(
            "Inventory not found for currency code:",
            transactionWithCart.country_id
          );
        }
      }
    }
  }

  async generateCsv(data: any[], outputPath: string) {
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: "id", title: "Id" },
        { id: "currency", title: "currency" },
      ], // Define your CSV header
    });

    await csvWriter.writeRecords(data);
  }
  async generateExcel(
    transactions: any,
    start_date: string,
    end_date: string,
    type: string
  ) {
    const workbook = new ExcelJS.Workbook();
    const sheet_name = start_date + "_" + end_date;
    const worksheet = workbook.addWorksheet(sheet_name);
    worksheet.columns = [
      { header: "Invoice No.", key: "invoice_num", width: 20 },
      { header: "Currency", key: "currency", width: 35 },
      { header: "Rate", key: "rate", width: 10 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Total", key: "total", width: 10 },
      {
        header: "Transaction Type",
        key: "transaction_type",
        width: 20,
        style: {},
      },
      { header: "Cash", key: "cash", width: 20 },
      { header: "Interac", key: "interac", width: 20 },
      { header: "Money Order", key: "money_order", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } }; // Font settings
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0000FF" },
    }; // Fill color (blue)
    const transformedData = transactions.map((transaction) => ({
      id: transaction.id,
      invoice_num: transaction.invoice_num,
      transaction_type: transaction.transaction_type,
      pay_in: transaction.pay_in,
      cash: transaction.cash,
      interac: transaction.interac,
      money_order: transaction.money_order,
      currency: transaction.carts.map((cart) => {
        return cart.currency;
      }),
      rate: transaction.carts.map((cart) => {
        return cart.rate;
      }),
      code: transaction.carts.map((cart) => {
        return cart.code;
      }),
      amount: transaction.carts.map((cart) => {
        return cart.currency_amount;
      }),
      total: transaction.carts.map((cart) => {
        return cart.total;
      }),
    }));

    let cell_start = 2;
    transformedData.forEach((transaction, transaction_index) => {
      //console.log("currency", transaction);
      let cell_end = 0;
      transaction.currency.map((currency, index) => {
        const xlData = {
          id: transaction.id,
          currency: currency,
        };

        //worksheet.addRow(xlData);
        const currency_length = transaction.currency.length;
        cell_end = cell_start + currency_length - 1;

        if (currency_length > 1) {
          if (index < 1) {
            worksheet.mergeCells(`A${cell_start}: A${cell_end}`);
            worksheet.mergeCells(`E${cell_start}: E${cell_end}`);
            worksheet.mergeCells(`F${cell_start}: F${cell_end}`);
            worksheet.mergeCells(`G${cell_start}: G${cell_end}`);
            worksheet.mergeCells(`H${cell_start}: H${cell_end}`);
            worksheet.mergeCells(`I${cell_start}: I${cell_end}`);

            worksheet.getCell(`A${cell_start}`).value = transaction.invoice_num;

            let num_array = [];
            for (let i = cell_start; i <= cell_end; i++) {
              num_array.push(i);
            }
            //console.log(transaction.amount[index]);
            //setting data from currency column
            num_array.map((num, index) => {
              worksheet.getCell(
                `B${num}`
              ).value = ` ${transaction.amount[index]} ${transaction.currency[index]} (${transaction.code[index]})`;
              worksheet.getCell(`C${num}`).value = transaction.rate[index];
              worksheet.getCell(`D${num}`).value = transaction.total[index];
              worksheet.getCell(`E${num}`).value = transaction.total.reduce(
                (sum: number, total) => sum + total,
                0
              );
              worksheet.getCell(
                `F${num}`
              ).value = `${transaction.transaction_type} (${transaction.pay_in})`;
              worksheet.getCell(`G${num}`).value = transaction.cash;
              worksheet.getCell(`H${num}`).value = transaction.interac;
              worksheet.getCell(`I${num}`).value = transaction.money_order;
            });
          }
        } else {
          worksheet.getCell(`A${cell_start}`).value = transaction.invoice_num;
          worksheet.getCell(
            `B${cell_start}`
          ).value = `${transaction.amount} ${currency} (${transaction.code})`;
          worksheet.getCell(`C${cell_start}`).value = transaction.rate[index];
          worksheet.getCell(`D${cell_start}`).value = transaction.total[index];
          worksheet.getCell(`E${cell_start}`).value = transaction.total.reduce(
            (sum: number, total) => sum + total,
            0
          );
          worksheet.getCell(
            `F${cell_start}`
          ).value = `${transaction.transaction_type} (${transaction.pay_in})`;
          worksheet.getCell(`G${cell_start}`).value = transaction.cash;
          worksheet.getCell(`H${cell_start}`).value = transaction.interac;
          worksheet.getCell(`I${cell_start}`).value = transaction.money_order;
        }
      });
      worksheet.getColumn(5).alignment = {
        vertical: "middle",
      };

      worksheet.getColumn(6).alignment = {
        vertical: "middle",
      };

      cell_start = cell_end + 1;
      //console.log("cell_start", cell_start);
    });
    // worksheet.mergeCells("A2:A3");
    // worksheet.getCell("A2").value = "Hello, World!";
    const excelFilePath = join(
      process.cwd(),
      "src",
      "csv",
      `${sheet_name}.xlsx`
    ); // Use .xlsx extension

    try {
      await workbook.xlsx.writeFile(excelFilePath);
      if (type === "backup") {
        const isEmailSent = await this.sendEmail(`${sheet_name}.xlsx`);
        if (isEmailSent) {
          // Email sent successfully
          return { message: "failed to send email" };
        } else {
          // Email sending failed

          console.log("Email sending failed");
        }
      } else {
        return { sheet_name: `${sheet_name}.xlsx`, message: "success" };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
      console.error("Error writing Excel file:", error);
      return "failed";
    }
  }

  async sendEmail(sheet_name: string) {
    const setting = await this.prisma.setting.findFirst();

    try {
      const attachmentPath = join(process.cwd(), "src", "csv", sheet_name);

      var response = await this.mailerService.sendMail({
        to: setting.email,
        from: "order@uexchange.ca",
        subject: "Backup data",
        text: "backup email",
        attachments: [
          {
            filename: sheet_name, // Set the desired filename for the attachment
            path: attachmentPath, // Replace with the actual file path
            cid: "unique-image-id", // Set a unique Content ID (CID) for the image
          },
        ],
      });
      return true;
    } catch (emailError) {
      if (emailError.code === "EENVELOPE") {
        throw new InternalServerErrorException("Invalid email envelope");
        console.error("Invalid email envelope:", emailError.message);
      } else if (emailError.code === "EAUTH") {
        throw new InternalServerErrorException(
          "Authentication error:Invalid credentials for email"
        );
        console.error("Authentication error:", emailError.message);
      } else {
        throw new InternalServerErrorException("Error sending email");
        console.error("Error sending email:", emailError);
      }
      // Handle the error here
      throw new InternalServerErrorException(emailError.message);
      return false;
      // throw new Error("Failed to send email");
    }
  }

  async filterTransactions(start_date: string, end_date: string, type: string) {
    const converted_start_date = new Date(start_date);
    const converted_end_date = new Date(end_date);
    converted_end_date.setHours(0, 0, 0, 0);
    converted_start_date.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: converted_start_date, // Greater than or equal to start_date
          lte: converted_end_date, // Less than or equal to end_date
        },
      },
      include: {
        carts: true,
      },
    });

    if (transactions.length > 0) {
      const response = await this.generateExcel(
        transactions,
        start_date,
        end_date,
        type
      );
      return response;
    } else {
      return { message: "no data found" };
    }
  }
}
