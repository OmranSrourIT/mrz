import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { withRouter } from './withRouter'; // Import the custom HOC
import { useNavigate } from 'react-router-dom';
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
      DataobjFilds: {},
      JsonObject: '{',
      base64String: "",
    };
    this.observer = null; // MutationObserver reference
    this.divRef = React.createRef();

  }

  navigateHome = (Path) => {
    
    debugger;
    this.props.navigate(Path, { state: 'jjjjjjjj'});
   
  };

  alertJssss(){
  alert('dcdcdcdcdc');
  }
 

  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result will be a base64 string
        this.setState({ base64String: reader.result });
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

  alertShown = false; 

  componentDidMount() {
    debugger;

    const { state } = this.props.location || {};
    const { message } = state || {};

    if (message && !this.alertShown) {
      alert(message); // Show the alert only if it hasn't been shown yet
      this.alertShown = true; // Set the flag to true
    }


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


  getTextFromDiv = () => {
    if (this.divRef.current) {

      if (this.divRef.current.textContent === "") {
        this.setState({
          Dataobj: {}
        })
        return;
      }
      if (this.divRef.current.textContent.includes(this.state.JsonObject)) {

        var DataObjectReuslt = this.divRef.current.textContent.split('}')[0];

        if (DataObjectReuslt.trim().slice(-1) !== '}') {
          DataObjectReuslt += '}';
        }
        const parsedData = JSON.parse(DataObjectReuslt);

        parsedData.birthDate = this.ConvertDateStringToDate(parsedData.birthDate);
        parsedData.expirationDate = this.ConvertDateStringToDate(parsedData.expirationDate);


        var DFullname = parsedData.firstName + ' ' + parsedData.lastName;
        var ObjFilds = this.splitName(DFullname);
        Object.assign(ObjFilds, parsedData);
        console.log(ObjFilds);
        this.setState({
          Dataobj: parsedData,
          DataobjFilds: this.splitName(DFullname)
        })

      } else {
        toast.warn('يرجى رفع صورة عن الجواز بالطريقه الصحيحه وابعاد مناسبة', {
          position: 'top-center',
          autoClose: 3000,
          style: {
            fontSize: '25px', // Increase font size
            padding: '25px',  // Add padding for larger size
            minWidth: '350px', // Set a larger width
            color: 'black',
            fontWeight: 'bold'
          },
        });

      }

    }
  };

  

  addingImage =() =>{ 
    const imgScan = document.getElementById('IMgScan');
    imgScan.src = "";
  }


  render() {

    const Dataobj = [this.state.Dataobj]
    const DataobjFilds = [this.state.DataobjFilds]
    const { base64String } = this.state;
   
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
              <input id="photo" name="photo" type="file"  className="file-upload-input" />
              <img id='IMgScan'  width={50} height={50} alt='Empty Image'></img>
            </div>


            <div> 
              {base64String && (
                <div>
                  <h3>Base64 String</h3>
                  <textarea rows="10" cols="50" value={base64String} readOnly />
                </div>
              )}
            </div>


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
            <div style={{ display: 'none' }} ref={this.divRef} id="parsed"></div>
            <div id="detected" className="detected-image"> 
            </div>

            <div className="data-form">
              <h2>بيانات جواز السفر</h2>
              <div className="form-groupData">
                <label>نوع الجواز</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].documentCode || "").toUpperCase()} readOnly />
              </div>

              <div className="form-groupData">
                <label>رقم الجواز</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].documentNumber || "").toUpperCase()} readOnly />
              </div>

              <div className="form-groupData">
                <label>الاسم الكامل</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].firstName || "").toUpperCase()} readOnly />
              </div>

              <div className="form-groupData">
                <label>الاسم الاخير</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].lastName || "").toUpperCase()} readOnly />
              </div>

              <div className="form-groupData">
                <label>مكان الاصدار</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].issuingState || "").toUpperCase()} readOnly />
              </div>

              <div className="form-groupData">
                <label>الجنسية</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].nationality || "").toUpperCase()} readOnly />
              </div>

              <div className="form-groupData">
                <label>تاريخ الميلاد</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Dataobj[0].birthDate || ""} readOnly />
              </div>

              <div className="form-groupData">
                <label>تاريخ الانتهاء</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={Dataobj[0].expirationDate || ""} readOnly />
              </div>

              <div className="form-groupData">
                <label>الجنس</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={(Dataobj[0].sex || "").toUpperCase()} readOnly />
              </div>
              {/* <div className="form-group">
                <label>الاسم الاول</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={DataobjFilds[0].firstNameSplit} readOnly />
                <label>الاسم الثاني</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={DataobjFilds[0].fatherNameSplit} readOnly />
                <label>الاسم الثالث</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={DataobjFilds[0].thirdNameSplit} readOnly />
                <label>الاسم الرابع</label>
                <input style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }} type="text" value={DataobjFilds[0].lastNameSplit} readOnly />
              </div> */}

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

 
