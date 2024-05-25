
import React, { useState } from 'react';
import { Layout, Typography, Card } from 'antd';
import UploadZip from './components/UploadZip';
import Canvas from './components/Canvas';

const { Header, Content } = Layout;

const { Title } = Typography;

const App = () => {
  const [imageSrc, setImageSrc] = useState(null);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Header style={{ background: '#20232a', padding: '0 20px' }}>
        <Title style={{ color: '#61dafb', lineHeight: '64px', margin: 0 }} level={3}>
          Image Annotation App
        </Title>
      </Header>

      <Content style={{ padding: '20px' }}>
        <div className="card-container">
          <Card 
            className="small-card" 
            title={<span style={{ color: '#20232a' }}>Upload Files</span>}
          >
            <UploadZip onUpload={setImageSrc} type="primary">UploadZip</UploadZip>

          </Card>
          <Card 
            className="big-card" 
            title={<span style={{ color: '#20232a' }}>Annotator</span>}
          >
            {imageSrc && <Canvas imageSrc={imageSrc} />}helloo
          </Card>

        </div>
        </Content>

    </Layout>
  );
};
export default App;