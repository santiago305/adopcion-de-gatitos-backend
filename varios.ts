@UseGuards(RolesGuard)
@Roles('admin', 'user') // <-- solo admin y user pueden entrar
@Get('privado')
getPrivado() {
  return 'solo admin y user';
}
// esta es la forma de utilizar lo que son los middlewares y los guards 