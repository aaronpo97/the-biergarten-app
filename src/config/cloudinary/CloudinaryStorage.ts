/* eslint-disable no-underscore-dangle */

import type { StorageEngine } from 'multer';
import type { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import type { Request } from 'express';

/**
 * Represents a storage engine for uploading files to Cloudinary.
 *
 * @example
 *   const storage = new CloudinaryStorage({
 *     cloudinary,
 *     params: {
 *       folder: 'my-folder',
 *       allowed_formats: ['jpg', 'png'],
 *     },
 *   });
 */
class CloudinaryStorage implements StorageEngine {
  private cloudinary: typeof cloudinary;

  private params: UploadApiOptions;

  /**
   * Creates an instance of CloudinaryStorage.
   *
   * @param options - The options for configuring the Cloudinary storage engine.
   * @param options.cloudinary - The Cloudinary instance.
   * @param options.params - The parameters for uploading files to Cloudinary.
   */
  constructor(options: { cloudinary: typeof cloudinary; params: UploadApiOptions }) {
    this.cloudinary = options.cloudinary;
    this.params = options.params;
  }

  /**
   * Removes the file from Cloudinary.
   *
   * @param req - The request object.
   * @param file - The file to be removed.
   * @param callback - The callback function to be called if an error occurs.
   */
  _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error) => void) {
    this.cloudinary.uploader.destroy(file.filename, { invalidate: true }, callback);
  }

  /**
   * Handles the file upload to Cloudinary.
   *
   * @param req - The request object.
   * @param file - The file to be uploaded.
   * @param callback - The callback function to be called after the file is uploaded.
   */
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ) {
    this.uploadFile(file)
      .then((cloudResponse) => {
        callback(null, {
          path: cloudResponse.secure_url,
          size: cloudResponse.bytes,
          filename: cloudResponse.public_id,
        });
      })
      .catch((error) => {
        callback(error);
      });
  }

  /**
   * Uploads a file to Cloudinary.
   *
   * @param file - The file to be uploaded.
   * @returns A promise that resolves to the upload response.
   */
  private uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        this.params,
        (err, response) => {
          if (err != null) {
            return reject(err);
          }
          return resolve(response!);
        },
      );

      file.stream.pipe(stream);
    });
  }
}

export default CloudinaryStorage;
