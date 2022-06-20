import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnguardedAuthRoute } from 'src/utilities';
import { UserService } from '../user/user.service';
import { CreateTokenDto } from './dto';
import { CreateTokenPipe } from './pipes';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  @Post()
  @UnguardedAuthRoute()
  async create(@Body(CreateTokenPipe) dto: CreateTokenDto) {
    const user = await this.userService.findOne({ email: dto.email });
    const token = this.tokenService.generate(user._id);
    return { user, token, message: 'token created successfully' };
  }

  @Post('/google')
  @UnguardedAuthRoute()
  @UseGuards(AuthGuard('google'))
  async createViaGoogle(@Req() req, @Res({ passthrough: true }) res) {
    const token = await this.tokenService.generate(req.user._id);
    res
      .status(201)
      .json({ user: req.user, token, message: 'token created successfully' });
  }
}
