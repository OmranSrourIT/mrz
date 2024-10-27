import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { withRouter } from './withRouter'; // Import the custom HOC
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PassportTemplte from '../images/TempPassport.jpg';
import 'react-toastify/dist/ReactToastify.css';
import './Mrz.css';

class OCRApp extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      Dataobj: {},  
      base64String: "",
    };
    
  }
 
  async GetDataFromOCR(ImageBase64)
  { 
    if(ImageBase64)
    {
      const postData = {
        image: ImageBase64, 
      };
  
      try {
        const response = await axios.post('http://192.168.3.129:3030/passImage', postData);
        debugger;
        this.setState({ Dataobj: response.data?.fields });
      } catch (error) {
        debugger;
        if(error.response)
        { 
         alert(error.response.data.message);
        }
       
      }

    }else
    {
      alert('Please adding Image')
    }
    
  }

  
  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        var UrlResultBase64  = reader.result;
        var ResultBase64 = reader.result?.split(',')[1]
        this.GetDataFromOCR(ResultBase64);
        const imgScan = document.getElementById('IMgScan');
        imgScan.src = UrlResultBase64 ;
     
        this.setState({ base64String: ResultBase64 });
      };
      reader.readAsDataURL(file); // Convert the file to base64 string
    }
  };


  splitName(fullName) {

    const compoundLastNamePrefixes = ['AL', 'BIN', 'BEN', 'DE LA', 'VAN', 'VON'];

    let nameParts = fullName.trim().split(/\s+/);
    let firstName = '';
    let fatherName = '';
    let thirdName = '';
    let lastName = '';

    // Check if the name contains enough parts to process
    if (nameParts.length >= 5) {
      // Handle the case with 5 or more name parts
      firstName = nameParts[0];  // First part is the first name
      fatherName = nameParts[1];  // Second part is the father's name
      thirdName = nameParts[2];  // Third part is the third name

      // Check for compound last name
      for (let i = 3; i < nameParts.length; i++) {
        if (compoundLastNamePrefixes.includes(nameParts[i].toUpperCase())) {
          lastName = nameParts.slice(i).join(' ');  // Rejoin the last name if compound
          break;
        }
      }

      // If no compound last name was found, treat the remaining parts as last name
      if (!lastName) {
        lastName = nameParts.slice(3).join(' ');
      }
    } else if (nameParts.length === 4) {
      // Handle names with 4 parts
      firstName = nameParts[0];  // First part as first name
      fatherName = nameParts[1];  // Second part as father's name
      thirdName = nameParts[2];  // Third part as third name
      lastName = nameParts[3];  // Last part as last name
    } else if (nameParts.length === 3) {
      // Handle names with 3 parts
      firstName = nameParts[0];  // First part as first name
      fatherName = nameParts[1];  // Second part as father's name
      lastName = nameParts[2];  // Third part as last name
    } else if (nameParts.length === 2) {
      // Handle names with 2 parts
      firstName = nameParts[0];  // First part as first name
      lastName = nameParts[1];  // Second part as last name
    } else if (nameParts.length === 1) {
      // Handle single part name
      firstName = nameParts[0];  // First part as first name
    }

    var NewObj = {
      firstNameSplit: firstName,
      fatherNameSplit: fatherName,
      thirdNameSplit: thirdName,
      lastNameSplit: lastName
    };

    return NewObj;

  }

  
  ConvertDateStringToDate = (DateString) => {


    if (DateString === "") {
      return "";
    }

    const inputDate = DateString; // YYMMDD format

    // Extract year, month, and day
    let year = parseInt(inputDate.substring(0, 2), 10);
    let month = parseInt(inputDate.substring(2, 4), 10); // Do not subtract 1 here
    let day = parseInt(inputDate.substring(4, 6), 10);

    // Adjust year: Assuming 1900s for years >= 50, otherwise 2000s
    year += year >= 50 ? 1900 : 2000;

    // Create date object
    const date = new Date(year, month - 1, day); // Subtract 1 for zero-indexed months only when creating the Date object

    // Format the date as DD-MM-YYYY
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${date.getFullYear()}`;

    return formattedDate;
  }


 


  render() {

    const Dataobj = this.state.Dataobj 
    debugger;
     
    return (
      <>

        <div>
          <ToastContainer />
        </div>
        <div className="wrapper">

          <div className='RowBtn'>
            <div className="file-upload">
              <button htmlFor="photo" className="file-upload-label">خروج</button>
            </div> 
            <div className="file-upload">
              <label htmlFor="photo" className="file-upload-label" >تحميل الصورة</label>
              <input id="photo" name="photo" type="file" onChange={this.handleFileChange}  className="file-upload-input" /> 
            </div>  
            <div>  
            </div> 
          </div>
  
          <div className="content">
            <div style={{ display: 'none' }} ref={this.divRef} id="parsed"></div>
          <div id="detected" className="detected-image"> 
          <img id='IMgScan' src={PassportTemplte} style={{width:'520px',height:'370px'}} alt='Empty Image'></img>
            </div>  
 
            <div className="data-form">
              <h2>بيانات جواز السفر</h2>
              <div className="form-groupData">
                <label>نوع الجواز</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj? Dataobj.documentCode :'' )} readOnly />
              </div>

              <div className="form-groupData">
                <label>رقم الجواز</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj?Dataobj.documentNumber :'' )} readOnly />
              </div>

              <div className="form-groupData">
                <label>الاسم الكامل</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj? Dataobj.firstName :'')} readOnly />
              </div>

              <div className="form-groupData">
                <label>الاسم الاخير</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj? Dataobj.lastName :'')} readOnly />
              </div>

              <div className="form-groupData">
                <label>مكان الاصدار</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj ? Dataobj.issuingState :'')} readOnly />
              </div>

              <div className="form-groupData">
                <label>الجنسية</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj? Dataobj.nationality :'')} readOnly />
              </div>

              <div className="form-groupData">
                <label>تاريخ الميلاد</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Dataobj? Dataobj.birthDate :''} readOnly />
              </div>

              <div className="form-groupData">
                <label>تاريخ الانتهاء</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Dataobj?Dataobj.expirationDate :''} readOnly />
              </div>

              <div className="form-groupData">
                <label>الجنس</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Dataobj?Dataobj.sex :''} readOnly />
              </div> 
              <button className="BtnTransfer" onClick={this.getTextFromDiv}>ترحيل البيانات</button>
            </div>
          </div>
        </div>


      </>
    );

  }
}

 
function HomePageWithNavigate(props) {
  const navigate = useNavigate();
  return <OCRApp clicked={()=>alert('sssssssss')} {...props} navigate={navigate} />;
}

export default withRouter(HomePageWithNavigate);

 
