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
        <Title style={{ color: '#e9e9ea', lineHeight: '64px', margin: 0 }} level={3}>
          Image Annotation App
        </Title>
      </Header>

      <Content style={{ padding: '20px' }}>
        <div className="card-container">
          <Card 
            className="small-card" 
            title={<span style={{ color: '#20232a' }}>Upload Files</span>}
          >
            <UploadZip onUpload={setImageSrc} type="primary">Upload Zip</UploadZip>
          </Card>

          <Card 
            className="big-card" 
            title={<span style={{ color: '#20232a' }}>Annotator</span>}
          >        
            {!imageSrc && (
              <div>
                <p>Please upload a file to display an image</p>
              </div> 
            )}

            {imageSrc && <Canvas imageSrc={imageSrc} />}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};
export default App;