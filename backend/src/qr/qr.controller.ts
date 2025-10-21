import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QrService } from './qr.service';

@ApiTags('QR Code')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('election/:slug')
  @ApiOperation({ summary: 'Generate QR code for election' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully' })
  async generateElectionQR(@Param('slug') slug: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const electionUrl = `${frontendUrl}/elections/${slug}`;
    
    try {
      const qrCodeBuffer = await this.qrService.generateQRCodeBuffer(electionUrl);
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="election-${slug}-qr.png"`,
      });
      
      res.send(qrCodeBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate QR code' });
    }
  }

  @Get('election/:slug/data')
  @ApiOperation({ summary: 'Get QR code data URL for election' })
  @ApiResponse({ status: 200, description: 'QR code data URL generated successfully' })
  async getElectionQRData(@Param('slug') slug: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const electionUrl = `${frontendUrl}/elections/${slug}`;
    
    const qrCodeDataURL = await this.qrService.generateQRCode(electionUrl);
    return { qrCode: qrCodeDataURL, url: electionUrl };
  }
}
