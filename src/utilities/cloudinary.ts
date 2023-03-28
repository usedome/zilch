import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from 'src/modules/config/config.service';
import { generateRandomToken } from '.';

const initCloudinary = (configService: ConfigService) => {
  cloudinary.config({
    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.get('CLOUDINARY_API_KEY'),
    api_secret: configService.get('CLOUDINARY_SECRET'),
    secure: true,
  });
};

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  configService: ConfigService,
): Promise<string> => {
  const folder = `${configService.get('CLOUDINARY_FOLDER')}/avatars`;
  const public_id =
    generateRandomToken(Number((Math.random() * 10).toFixed(0) as any)) +
    generateRandomToken(Number((Math.random() * 10).toFixed(0) as any), true);
  initCloudinary(configService);

  try {
    const response = await cloudinary.uploader.upload(file.path, {
      folder,
      public_id,
      access_mode: 'public',
      resource_type: 'auto',
    });
    return response?.secure_url;
  } catch (error) {
    console.log(error);
    return null;
  }
};
