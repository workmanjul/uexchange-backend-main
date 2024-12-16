import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const multerConfig = {
  storage: diskStorage({
    destination: function (req, res, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.originalname.split('.')[0];
      cb(null, filename + '-' + uniqueSuffix + '.png');
    },
  }),
  fileFilter: (req: any, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new BadRequestException('Only .png, .jpg and .jpeg format allowed!'),
      );
    }
  },
};
