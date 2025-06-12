import { Controller, Post, Body, Patch, Param, Get, UseGuards, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { CreateAnimalsDto } from './dto/create-animal.dto';
import { UpdateAnimalsDto } from './dto/update-animal.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs'; // Para trabajar con archivos y directorios

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  // Subir una imagen
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        // Definir la ruta de la carpeta 'uploads/animals'
        const uploadPath = './uploads/animals';

        // Verificar si la carpeta 'uploads/animals' existe, y si no, crearla
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        callback(null, uploadPath); // Usamos la carpeta 'uploads/animals' como destino
      },
      filename: (req, file, callback) => {
        const fileName = `${Date.now()}${extname(file.originalname)}`; // Generar un nombre único para el archivo
        callback(null, fileName);
      },
    }),
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No se ha cargado ningún archivo.' };
    }

    // Devolver la URL completa para acceder a la imagen
    return {
      message: 'Imagen cargada correctamente',
      file: `http://localhost:3000/uploads/animals/${file.filename}`, // Retornar la URL completa
    };
  }

  // Crear un animal
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async create(@Body() dto: CreateAnimalsDto) {
    return this.animalsService.create(dto);
  }

  // Obtener todos los animales con paginación
  @Get('')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page: number = 1,  // Parámetro de página (por defecto 1)
    @Query('limit') limit: number = 15 // Parámetro de límite (por defecto 15)
  ) {
    return this.animalsService.findAll(page, limit);
  }

  // Buscar un animal por ID
  @Get('search/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.animalsService.findOne(id);
  }

  // Buscar animales por nombre
  @Get('searchByName')
  @UseGuards(JwtAuthGuard)
  findByName(@Query('name') name: string) {
    return this.animalsService.findByName(name);
  }

  // Actualizar un animal
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateAnimalsDto) {
    return this.animalsService.update(id, dto);
  }

  // Eliminar un animal (marcar como eliminado)
  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.animalsService.remove(id);
  }

  // Restaurar un animal (restaurar el estado eliminado)
  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.animalsService.restore(id);
  }
}
