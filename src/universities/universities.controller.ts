import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, UpdateUniversityDto } from './dto';
import { Public } from 'src/auth/common/decorators';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  create(@Body() dto: CreateUniversityDto) {
    return this.universitiesService.create(dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.universitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUniversityDto) {
    return this.universitiesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.universitiesService.remove(+id);
  }
}
