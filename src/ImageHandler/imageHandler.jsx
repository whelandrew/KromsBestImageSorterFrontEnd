import React from 'react';
import './imageHandler.css';
import { Image } from './Image.js';
import { Spinner, Button } from 'react-bootstrap';
import ReactDOM from 'react-dom';

class ImageHandler extends React.Component 
{	
	constructor(props)
	{
		super(props);
		
		this.SetupControls = this.SetupControls.bind(this);
		
		this.state = 
		{			
			currImage : null,
			currImageData : null,
			allImages:null,
			imageVal:-1,
			isReady:false,
			thumbsUp : "./Resources/thumbsUp.png",
			thumbsDown : "./Resources/thumbsDown.png",
			dontKnow : "./Resources/dontknow.png"
		}
	}	
	
	componentDidMount()
	{
		console.log('ImageHandler');
		this.GetImages();
	}	
	
	GetImages()
	{
		fetch('https://kromsimagesortingserver.herokuapp.com/ListFolder',
		{
			method: "POST",	
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			'Accept': 'application/json',	
			body: JSON.stringify({'folderLoc':this.props.folderData.id})
		})
		.then(response => response.text())
		.then(data => {
			this.LoadScreen(true);
			let arr=[];
			const images = JSON.parse(data);		
				
			images.forEach(i=>{
				if(i[".tag"]==="file")
				{
					arr.push(i);
				}
			});					
			//TODO - get preview data for image		
			this.setState({allImages:arr});					
			this.setState({imageVal:0});
			this.GetPreviewData(arr[0],0);
		})
		.catch((error) => 
		{
			console.error('Error:', error);
		});	
	}
	
	LoadScreen(isOn)
	{		
		let loadscreen = document.getElementById('loading');		
		let render = (<div />);
		if(isOn)
		{			
			render = (<Spinner id="spinner" animation="grow" role="status">
							<span className="sr-only">Loading Images</span>
					  </Spinner>);
		}		
		ReactDOM.render(render, loadscreen);
	}
	
	GetPreviewData(image, val)
	{
		console.log('GetPreviewData');		
		this.LoadScreen(true);
		this.setState({imageVal:val});	
		fetch('https://kromsimagesortingserver.herokuapp.com/GetMetaData', 
		{
			method: "POST",	
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			'Accept': 'application/json',	
			body: JSON.stringify({'id':image.id})
		})
		.then(response => response.text())
		.then(data => {			
			const image = new Image(JSON.parse(data));
			this.setState({currImageData : image});
			this.ShowCurrentImage(image.filePath);
			this.ShowImageInfo(this.state.allImages[val]);
		})
		.catch((error) => 
		{
			console.error('Error:', error);
		});	
	}
	
	ShowImageInfo(image)
	{
		let infoDump = document.getElementById('rightSide2');
		let info='<h3>Name</h3><p>'+image.name+'</p>';
		info+='<h3>Location</h3><p>'+image.path+'</p>';
		info+='<h3>Type</h3><p>'+image.type+'</p>';
		info+='<h3>Full Image</h3><a id="previewLink" target="_blank" href="'+image.filePath+'">Click Here</a>';
		infoDump.innerHTML = info;
	}
	
	ShowCurrentImage(image)
	{	
		image = image.replace('dl=0','dl=1');				
		this.setState({currImage:image});		
		this.SetupControls(image);		
	}
	
	MoveImageToFolder(imagePath, folderName, imageName)
	{	
		console.log('MoveImageToFolder');		
		this.LoadScreen(true);
		fetch('https://kromsimagesortingserver.herokuapp.com/MoveImageToFolder', 
		{
			method: "POST",	
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			'Accept': 'application/json',	
			body: JSON.stringify({'fromPath': imagePath, 'toPath' : folderName + imageName})
		})
		.then(response => response.text())
		.then(data => {			
			const imageVal = this.state.imageVal;				
			this.GetPreviewData(this.state.allImages[imageVal + 1], (imageVal + 1));
		})
		.catch((error) => 
		{
			console.error('Error:', error);
		});	
	}	

	PreviousImageDisplay(image)
	{
		console.log("PreviousImageDisplay " + image);
	}
	
	PreviousImagesList(image)
	{			
		let previousImage = "<div class='dontknowImage' id='" + image.id + "'>";
		previousImage += "<Button class='prevImage'>"
		previousImage += "<img src='" + image.filePath.replace('dl=0','dl=1') + "'/>"
		previousImage += "</Button>";
		previousImage += "<p>"+image.name+"</p>"	
		previousImage += "</div>";
		
		let previousImageBody = document.getElementById("previousImageBody");
		previousImageBody.innerHTML = previousImage;
		
		const length = this.state.imageVal;
		this.GetPreviewData(this.state.allImages[length + 1], length + 1);
	}
	
	SetupControls(e)
	{		
		const image = this.state.currImageData;		
		if(typeof e != "string")
		{
			if(e.target.id==="yesButton")
			{				
				if(image != null)
					this.MoveImageToFolder(image.path, 'YesFolder/', image.name);
			}
			
			if(e.target.id==="noButton")
			{
				if(image != null)
					this.MoveImageToFolder(image.path, 'NoFolder/', image.name);
			}
			
			if(e.target.id==="skipButton")
			{				
				if(image != null)
					this.PreviousImagesList(image);
			}
		}
	}
	
	render() 
    {	  
		return(<div>								
				<div id="imageController">
					<Button id="yesButton" onClick={this.SetupControls}>
						<img id="yesButton" alt="Yes" src={this.state.thumbsUp}/>
					</Button>
					<Button id="skipButton" onClick={this.SetupControls}>
						<img id="skipButton" alt="DontKnow" src={this.state.dontKnow}/>
					</Button>
					<Button id="noButton" onClick={this.SetupControls}>
						<img id="noButton" alt="No" src={this.state.thumbsDown}/>
					</Button>
				</div>
				<img onLoad={()=>this.LoadScreen(false)} className="currImage" src={this.state.currImage} alt="A Pic"/>				
			</div>)  
	}
}

export default ImageHandler;