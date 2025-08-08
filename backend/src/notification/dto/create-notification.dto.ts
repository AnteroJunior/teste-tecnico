import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class NotificacaoDto {
  @IsUUID()
  mensagemId: string;

  @IsString()
  @IsNotEmpty()
  conteudoMensagem: string;
}
