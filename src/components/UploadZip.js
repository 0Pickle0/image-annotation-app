import React from 'react';
import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import JSZip from 'jszip';

const UploadZip = ({ onUpload }) => {
  const props = {
    accept: '.zip',
    beforeUpload: file => {
      const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
      if (!isZip) {
        message.error('You can only upload ZIP files!');
      }
      return isZip || Upload.LIST_IGNORE;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      const zip = new JSZip();
      try {
        const content = await zip.loadAsync(file);
        const fileName = Object.keys(content.files).find(name => name.endsWith('.png'));
        if (fileName) {
          const imageFile = await content.file(fileName).async('blob');
          const imageUrl = URL.createObjectURL(imageFile);
          onUpload(imageUrl);
          onSuccess('ok');
        } else {
          message.error('No PNG file found in the ZIP archive!');
          onError('No PNG file found in the ZIP archive');
        }
      } catch (error) {
        message.error('Failed to extract ZIP file!');
        onError(error);
      }
    },
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Upload ZIP</Button>
    </Upload>
  );
};

export default UploadZip;
