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
      UrlBase64IMage : "",
    };
    
  }

  componentDidMount()
  {
    debugger;
    const { state } = this.props.location;
   
    if(state?.message)
      {
    var reulst = state?.message;
    const imgScan = document.getElementById('IMgScan'); 
    imgScan.src = reulst;
   
      this.GetDataFromOCR(reulst?.split(',')[1]); 

      debugger; 
      this.props.navigate(this.props.location.pathname, { replace: true, state: {} });

    }
  
    
  }

  navigateHome = (Path) => {
    
    debugger;
    // Send this.props along with the URL
    this.props.navigate(Path, { state: { 
      urlImage: this.state.UrlBase64Image,
      ...this.props.props // Spread operator to send all props
    }});
   
  };
 
  async GetDataFromOCR(ImageBase64)
  { 
    if(ImageBase64)
    {
      const postData = {
        image: ImageBase64, 
      };
  
      try {
        const response = await axios.post('http://localhost:3030/passImage', postData);
        
        var DFullname = response.data?.fields.firstName + ' ' + response.data?.fields.lastName 
        
        var ObNewjFilds = this.splitName(DFullname);
        Object.assign(ObNewjFilds, response.data?.fields);

        this.setState(
          { Dataobj: ObNewjFilds , IsDataFill : true 

          },()=>{ 
        //    this.props.props.ImageOCRValue.setValue(JSON.stringify(ObNewjFilds));
          });
          debugger;

      } catch (error) {
        debugger;
        if(error.response)
        { 
          this.setState({
            Dataobj: {
              documentCode: '',
              documentNumber: '',
              firstName: '',
              lastName: '',
              issuingState: '',
              nationality: '',
              birthDate: '',
              expirationDate: '',
              sex: ''
            }, 
            base64String: "",
            IsDataFill:false
          },()=>{
            debugger;
            alert(error.response.data.message);
          })

        
        }
       
      }

    }else
    { 
      alert('Please adding Image')
    }
    
  }

  
  handleFileChange = (event) => {
    debugger;
    this.setState({ base64String: "" , Dataobj: {
      documentCode: '',
      documentNumber: '',
      firstName: '',
      lastName: '',
      issuingState: '',
      nationality: '',
      birthDate: '',
      expirationDate: '',
      sex: ''
    }, },()=>{
      const imgScan = document.getElementById('IMgScan');
      var UrlResultBase64  = "";
      var ResultBase64 = "" ; 
      imgScan.src = "";
      
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if(reader.result){
            UrlResultBase64  = reader.result;
            ResultBase64 = reader.result?.split(',')[1]
           this.GetDataFromOCR(ResultBase64);
          
           imgScan.src = UrlResultBase64 ;
        
           this.setState({ base64String: ResultBase64 , UrlBase64IMage :UrlResultBase64  });
          }
         
        };
        reader.readAsDataURL(file); // Convert the file to base64 string
      }
    });
  

    
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

    debugger;

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
              <button onClick={()=>this.navigateHome('/Scanner')} htmlFor="photo" className="file-upload-label">مسح مستمسك</button>
            </div>
            <div className="file-upload">
              <label htmlFor="photo" className="file-upload-label" >تحميل الصورة</label>
              <input id="photo" name="photo" type="file" accept="image/*" onChange={this.handleFileChange}  className="file-upload-input" /> 
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
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Object.keys(Dataobj).length > 0 && Dataobj.documentCode !=''? Dataobj.documentCode?.toUpperCase() :'' } readOnly />
              </div> 
              <div className="form-groupData">
                <label>رقم الجواز</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Object.keys(Dataobj).length > 0 && Dataobj.documentNumber !=''?Dataobj.documentNumber?.toUpperCase() :'' )} readOnly />
              </div> 
              <div className="form-groupData">
                <label>الاسم الكامل</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Object.keys(Dataobj).length > 0 && Dataobj.firstName !=''? Dataobj.firstName?.toUpperCase() :'')} readOnly />
              </div> 
              <div className="form-groupData">
                <label>الاسم الاخير</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Object.keys(Dataobj).length > 0 && Dataobj.lastName !=''? Dataobj.lastName?.toUpperCase() :'')} readOnly />
              </div> 
              <div className="form-groupData">
                <label>مكان الاصدار</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Object.keys(Dataobj).length > 0 && Dataobj.issuingState !=''? Dataobj.issuingState :'')} readOnly />
              </div> 
              <div className="form-groupData">
                <label>الجنسية</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Object.keys(Dataobj).length > 0 && Dataobj.nationality !=''? Dataobj.nationality?.toUpperCase() :''} readOnly />
              </div> 
              <div className="form-groupData">
                <label>تاريخ الميلاد</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Object.keys(Dataobj).length > 0 && Dataobj.birthDate !=''?this.ConvertDateStringToDate(Dataobj.birthDate):''} readOnly />
              </div> 
              <div className="form-groupData">
                <label>تاريخ الانتهاء</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Object.keys(Dataobj).length > 0 && Dataobj.expirationDate !=''?this.ConvertDateStringToDate(Dataobj.expirationDate) :''} readOnly />
              </div> 
              <div className="form-groupData">
                <label>الجنس</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Object.keys(Dataobj).length > 0 && Dataobj.sex !=''?Dataobj.sex?.toUpperCase() :''} readOnly />
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
  return <OCRApp {...props} navigate={navigate} />;
}

export default withRouter(HomePageWithNavigate);

 
