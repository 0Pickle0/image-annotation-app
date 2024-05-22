
import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import UploadZip from './components/UploadZip';
import Canvas from './components/Canvas';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [imageSrc, setImageSrc] = useState(null);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
          <h1 style={{ color: 'black', textAlign: 'center' }}>Image Labeling App</h1>

        <Layout      
          style={{
            flexDirection: 'row',
            margin: '24px 16px 0',
          }}>
          <Content
          style={{
            margin: '24px 16px 0',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <UploadZip onUpload={setImageSrc} type="primary">UploadZip</UploadZip>
          </div>
          </Content>

          <Content
          style={{
            margin: '24px 16px 0',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {imageSrc && <Canvas imageSrc={imageSrc} />}helloo
          </div>
        </Content>

        </Layout>


        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;