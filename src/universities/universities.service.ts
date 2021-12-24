import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@Injectable()
export class UniversitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUniversityDto) {
    return await this.prisma.university.create({
      data: dto,
    });
  }

  async findAll() {
    return await this.prisma.university.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.university.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, dto: UpdateUniversityDto) {
    return await this.prisma.university.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: number) {
    return await this.prisma.university.delete({
      where: {
        id,
      },
    });
  }
}
