import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Res,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";
import { join } from "path";
import * as path from "path";
import * as fs from "fs";
import { TradingService } from "./trading.service";
import { CreateTradingDto } from "./dto/create-trading.dto";
import { UpdateTradingDto } from "./dto/update-trading.dto";
import { SoftDeleteDto } from "./dto/SoftDelete.dto";
import AtGuard from "src/role/atguard";
import { Request } from "express";
import { createReadStream } from "fs";

@Controller("trading")
@UseGuards(AtGuard)
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post()
  create(@Body() createTradingDto: CreateTradingDto, @Req() req: Request) {
    return this.tradingService.create(createTradingDto, req.user);
  }
  @Post("soft-delete")
  softDelete(@Body() softDeleteDto: SoftDeleteDto) {
    return this.tradingService.softDelete(softDeleteDto);
  }
  @Get("filter")
  async filterTransactions(
    @Res() res: Response,
    @Query("start_date") start_date: string,
    @Query("end_date") end_date: string,
    @Query("type") type: string
  ) {
    const response = await this.tradingService.filterTransactions(
      start_date,
      end_date,
      type
    );

    if (type === "backup") {
      if (response["message"] === "no data found") {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.status(200).json({ message: "success" });
    }
  }

  @Get("export-data")
  async exportData(
    @Res() res: Response,
    @Query("start_date") start_date: string,
    @Query("end_date") end_date: string,
    type: string
  ) {
    const response = await this.tradingService.filterTransactions(
      start_date,
      end_date,
      type
    );
    console.log(response);
    if (response["message"] === "no data found") {
      console.log("message");
      return res.status(404).json({ message: "File not founddddd" });
    }

    const filePath = join(process.cwd(), "src", "csv", response["sheet_name"]);
    const fileName = response["sheet_name"];
    if (fs.existsSync(filePath)) {
      res.setHeader("Access-Control-Expose-Headers", "X-Suggested-Filename");
      res.setHeader("X-Suggested-Filename", fileName);
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      // Send the file as a response using the correct filePath
      res.sendFile(filePath); // Use the same filePath variable here
    } else {
      // If the file doesn't exist, send a JSON response
      res.status(404).json({ message: "File not found" });
    }
  }

  @Get()
  findAll(@Query("page") page: number, @Query("pageSize") pageSize: number) {
    return this.tradingService.findAll(page, pageSize);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tradingService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTradingDto: UpdateTradingDto) {
    return this.tradingService.update(+id, updateTradingDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tradingService.remove(+id);
  }
}
