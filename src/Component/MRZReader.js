import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Mrz.css';

class OCRApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: null,
      ocrText: '',
      loading: false,
      json: null,
      Dataobj: {},
      JsonObject: '{'
    };
    this.observer = null; // MutationObserver reference
    this.divRef = React.createRef();

  }


  componentDidMount() {
 
    const div = this.divRef.current;

    // Create a MutationObserver to watch for changes to the div's content
    this.observer = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this.handleDivContentChange(); // Call the function when div content changes
        }
      }
    });

    // Configure the observer to watch for content changes (text, child elements)
    this.observer.observe(div, { childList: true, characterData: true, subtree: true });
 
    setTimeout(() => {

      // Create a script tag
      const script = document.createElement('script');

      // Set the src attribute to the external JS file
      script.src = './demo.bundle.js';
      script.async = true;
      // Append the script tag to the body
      document.body.appendChild(script);

    }, 2000);
 

    const script2 = document.createElement('script');

    // Set the src attribute to the external JS file
    script2.src = './mrz-worker.bundle-wrapped.js';
    script2.async = true;
    // Append the script tag to the body
    document.body.appendChild(script2);



  }

  componentWillUnmount() {
    // Disconnect the observer when the component unmounts to avoid memory leaks
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleDivContentChange = () => {
 this.getTextFromDiv();
  };

  

  ConvertDateStringToDate = (DateString) => {
     
    if (DateString === "") {
      return "";
    }
    const inputDate = DateString; // YYMMDD format

    // Extract year, month, and day
    let year = parseInt(inputDate.substring(0, 2), 10);
    let month = parseInt(inputDate.substring(2, 4), 10) - 1; // Months are 0-indexed in JavaScript Date
    let day = parseInt(inputDate.substring(4, 6), 10);

    // Adjust year: Assuming 1900s for years < 50, otherwise 2000s
    year += year < 50 ? 2000 : 1900;

    // Create date object
    const date = new Date(year, month, day);

    // Format the date as YYYY-MM-DD
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

    return formattedDate;

  }
 
  getTextFromDiv = () => {
    if (this.divRef.current) {

      debugger;
      if(this.divRef.current.textContent === "")
      {
        this.setState({
          Dataobj :{}
        })
        return;
      }
      if (this.divRef.current.textContent.includes(this.state.JsonObject)) {

        var DataObjectReuslt = this.divRef.current.textContent.split('}')[0];
 
        if (DataObjectReuslt.trim().slice(-1) !== '}') {
          DataObjectReuslt += '}';
        }
        const parsedData = JSON.parse(DataObjectReuslt);
      
        this.setState({
          Dataobj: parsedData
        })
         
      } else {
        toast.warn('يرجى رفع صورة عن الجواز بالطريقه الصحيحه وابعاد مناسبة', {
            position: 'top-center',
            autoClose: 3000, 
            style: { 
              fontSize: '25px', // Increase font size
              padding: '25px',  // Add padding for larger size
              minWidth: '350px', // Set a larger width
              color : 'black',
              fontWeight : 'bold'
          },
        });
      
      }

    }
  };

     
  render() {

    const Dataobj = [this.state.Dataobj]

    return (
      <>

        <div>
          <ToastContainer />
        </div>
        <div className="wrapper">

          <div className="file-upload">
            <label htmlFor="photo" className="file-upload-label">تحميل الصورة</label>
            <input id="photo" name="photo" type="file" className="file-upload-input" />
          </div>
 
          <div className="progress">
            <div className="gradient">
              <div className="progress-wrapper">
                <div className="progress-text"></div>
                <progress></progress>
              </div>
            </div>
          </div>
          <div className="content">
            <div  style={{ display: 'none' }} ref={this.divRef} id="parsed"></div>
            <div id="detected"  className="detected-image">
              <canvas onDoubleClick={()=>{alert('ddd')}} id="canvas"></canvas>
            </div>

            <div className="data-form">
              <h2>Document Details</h2>

              <div className="form-group">
                <label>Document Code</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={(Dataobj[0].documentCode || "").toUpperCase()} readOnly />
              </div>

              <div className="form-group">
                <label>First Name</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={(Dataobj[0].firstName || "").toUpperCase()} readOnly />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={(Dataobj[0].lastName || "").toUpperCase()} readOnly />
              </div>

              <div className="form-group">
                <label>Issuing State</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={(Dataobj[0].issuingState || "").toUpperCase()} readOnly />
              </div>

              <div className="form-group">
                <label>Nationality</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={(Dataobj[0].nationality || "").toUpperCase()} readOnly />
              </div>

              <div className="form-group">
                <label>Birth Date</label>
                <input  style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={this.ConvertDateStringToDate(Dataobj[0].birthDate || "")} readOnly />
              </div>

              <div className="form-group">
                <label>Expiration Date</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={this.ConvertDateStringToDate(Dataobj[0].expirationDate || "")} readOnly />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <input style={{color:'red' , fontWeight:'bold',textAlign:'center'}} type="text" value={(Dataobj[0].sex || "").toUpperCase()} readOnly />
              </div>

              <button style={{fontWeight:'bold',fontSize:'20px'}} onClick={this.getTextFromDiv}>ترحيل البيانات</button>
            </div>
          </div>
        </div>
      </>
    );

  }
}

export default OCRApp;
