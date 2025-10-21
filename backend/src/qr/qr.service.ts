import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class QrService {
  @ApiOperation({ summary: 'Generate QR code for election' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully' })
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeBuffer;
    } catch (error) {
      throw new Error('Failed to generate QR code buffer');
    }
  }
}
