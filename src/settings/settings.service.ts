import { Injectable } from "@nestjs/common";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}
  async create(createSettingDto: CreateSettingDto) {
    const setting = await this.prisma.setting.create({
      data: createSettingDto,
    });
    if (setting) {
      return "success";
    }
  }

  async findAll() {
    return await this.prisma.setting.findFirst({});
  }

  async findOne(id: number) {
    return await this.prisma.setting.findUnique({ where: { id: id } });
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    console.log(updateSettingDto);
    const data = await this.prisma.$transaction(async (prisma) => {
      const data: any = {
        email: updateSettingDto.email,
      };
      console.log('data',data);
      const updatedSetting = await prisma.setting.update({
        where: { id: id },
        data: data,
      });
      console.log('updated',updatedSetting);
      return updatedSetting; // Return the updated news inside the transaction callback
    });
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
