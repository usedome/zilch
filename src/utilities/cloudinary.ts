import { v2 as cloudinary } from 'cloudinary';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/modules/user/user.schema';
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
  user: HydratedDocument<User>,
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

    await deleteFromCloudinary(configService, user.avatar);
    return response?.secure_url;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const deleteFromCloudinary = async (
  configService: ConfigService,
  avatar?: string,
) => {
  if (!avatar || !avatar?.includes('cloudinary')) return;

  initCloudinary(configService);
  const public_id = `${configService.get('CLOUDINARY_FOLDER')}/avatars/${
    avatar.split('/avatars/')[1].split('.')[0]
  }`;

  await cloudinary.uploader.destroy(public_id);
};
