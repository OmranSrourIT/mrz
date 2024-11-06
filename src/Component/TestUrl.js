import React, { Component } from 'react'

export default class TestUrl extends Component {
    render() {
        const url = 'https://echecker.enginero.com/app/mendix_redirect?pid=41'; // رابطك هنا
    
        return (
          <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <iframe
              src={url}
              title="Embedded Page"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allowFullScreen
            />
          </div>
        );
      }
}
