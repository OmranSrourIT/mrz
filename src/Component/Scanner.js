import React, { Component } from 'react' 
import { withRouter } from './withRouter'; // Import the custom HOC
 class Scanner extends Component {

  handleButtonClick = () => {
    // Navigate to another page, passing data as state
    this.props.navigate('/', { state: { message: 'Hello from Scanner!' } });
  };


  render() {

     
    debugger;
    return (
      <div>
           <button onClick={this.handleButtonClick}>Go to Another Page</button>
        </div>
    )
  }
}

export default withRouter(Scanner);