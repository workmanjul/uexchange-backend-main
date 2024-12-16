// src/prisma/prisma.service.ts

import {
  INestApplication,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient({});
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
  async findOrFail<T>(model: string, id: number): Promise<T> {
    const record = await this.prisma[model].findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`${model} not found`, "not found");
    }

    return record;
  }
  async deleteOrThrow<T>(model: string, id: any): Promise<T> {
    const record = await this.prisma[model].findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`${model} not found`, "not found");
    }

    await this[model].delete({ where: { id } });

    return record;
  }
}
