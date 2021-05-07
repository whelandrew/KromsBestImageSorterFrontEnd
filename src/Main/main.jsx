import React from 'react';
import ReactDOM from 'react-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ImageHandler from '../ImageHandler/imageHandler.jsx';
import Chooser from '../Modals/DropboxChooser.js';
import './main.css';

class ImageSorterMain extends React.Component
{	
	constructor(props)
	{
		super(props);	
		
		this.GetFiles = this.GetFiles.bind(this);
		this.FolderClick=this.FolderClick.bind(this);
		
		this.state =
		{
			loggedIn:false,
			folderData: {value:"No Folder Selected"}
		}
	}	
	
	componentDidMount()
	{	
		this.Login();
	}
	
	Login()
	{
		fetch('/', 
		{
			method: "GET",			
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
		//.then(response => response.text())
		.then(result => {
			console.log("Login Accepted");
			this.setState({loggedIn: true});
		})
		.catch((error) => 
		{
			console.error('Error:', error);
		});		
	}
	
	GetFiles(files){
		this.UpdateFiles(files);		
		document.getElementById('modal').style.display='none';
	}
	
	UpdateFiles(files)
	{		
		console.log('UpdateFiles');
		this.setState({allFiles: files.foundFiles});
		this.setState({currImage: 0});
	}
	
	FolderSetup()
	{		
		if(!this.state.loggedIn) return;
	
		return (<p> {this.state.folderData.value}<Button onClick={()=>this.RunFolderSelection()}> Refresh</Button></p>)
	}
	
	FolderClick(e)
	{	
		if(e.target.className)
		{
			if(e.target.className.includes("finalFolder"))
			{
				const newFolder = e.target;
				this.setState({folderData:newFolder});
				document.getElementById('modal').style.display="none";
				ReactDOM.render(<ImageHandler {...this.state}/>, document.getElementById("center2"));
			}
		}
	}
	
	RunFolderSelection()
	{
		let popUp = document.getElementById('modal');
		popUp.style.display = "block"		
		ReactDOM.render(<Chooser />, document.getElementById('modal'));		
		document.addEventListener('mousedown', this.FolderClick);		
	}	
	
	DisplayLogin()
	{
		return this.state.loggedIn ? (
			<p>Logged Out<Button>Log Out</Button></p>
			):(
			<p>Logged In<Button>Log In</Button></p>)
	}

  render() 
  {
	  return(<div>			
				<div id="main">					
					<div id="modal"/>	
					<div id="loading"/>
					<Table id="mainTable" striped bordered hover>
					  <thead>
						<tr>
							<th id="leftSide">
								{this.DisplayLogin()}
							</th>
							<th id="center">
								{this.FolderSetup()}
								Current Image
							</th>
							<th id="rightSide">
								<Button id="purgeButton">Purge Delete Folder</Button> 
								Image Info
							</th>
						</tr>
					  </thead>
					  <tbody>
						<tr>
							<td id="leftSide2">	
								<div id="previousImageBody"/>
							</td>
							<td id="center2">
							</td>
							<td id="rightSide2">
							</td>						  
						</tr>
					  </tbody>
					</Table>
				</div>
		</div>);
  }
}

export default ImageSorterMain;