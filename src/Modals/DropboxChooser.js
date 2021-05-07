import React, { useEffect } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import './dropboxChooser.css'
import ReactDOM from 'react-dom';

export default function Chooser()
{			
	useEffect(() => {	
		ChooserLayout();
	});	
	
	function LoadScreen(isOn)
	{		
		let loadscreen = document.getElementById('loading');		
		let render = (<div />);
		if(isOn)
		{			
			render = (<Spinner id="spinner" animation="grow" role="status">
							<span className="sr-only">Loading Folders</span>
						</Spinner>);
		}		
		ReactDOM.render(render, loadscreen);
	}	
	
	function ChooserLayout()
	{	
		LoadScreen(true);		
		InitFolderData();
	}	
	
	function InitFolderData()
	{
		console.log('GetAllFolders');
		fetch('https://kromsimagesortingserver.herokuapp.com/ListFolder', 
		{
			method: "POST",	
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			'Accept': 'application/json',	
			body: JSON.stringify({'folderLoc':""})
		})
		.then(response => response.text())
		.then(data => {	
			let files = JSON.parse(data);			
			console.log("Received Folders List");
			//TODO get child folders
			files.forEach( i=> {
				if(i[".tag"]==="folder")
				{
					if(!parentList.some(x=>x.id===i.id))
					{
						parentList.push(i);
					}
				}
			});			
			
			GetChildData();
		})
		.catch((error) => 
		{
			console.error('Error:', error);
		});	
	}	
	
	let parentList=[];
	let childList=[];	
	let listCheck=0;	
	
	function BuildFinalList()
	{				
		//create a list of folders with their children attached (fuck you, Business Class Dropbox!
		let finalList=[];
		parentList.forEach(i=>
		{		
			if(!finalList.some(x=>x.id===parentList.id))
			{
				let newParent=i;
				newParent['child']=[];
				childList.forEach(j=>
				{
					if(j.path_lower.includes(i.path_lower))
					{
						let newFolder = j;
						newFolder.isChild = true;
						newParent['child'].push(newFolder);						
					}
				});
				finalList.push(newParent);
			}
		});
		
		let accordion = "<h2> Select A Folder To View </h2>"; 
		finalList.forEach(i=>
		{			
			if(i.child.length > 0)
			{				
				accordion += '<button class="accordion">';
				accordion += i.path_display;
				
				accordion += '<div class="childFolderList">';
				//apply child
				i.child.forEach( j=> {					
					accordion += '<button value="' + j.path_lower + '"id="' + j.id + '" class="childFolder finalFolder">'+ j.path_lower +'</button>';					
				});
				accordion += '</div>';			
			}
			else
			{
				accordion += '<button id="' + i.id + '" class="accordion finalFolder">';
				accordion += i.path_display;
			}
			accordion += '</button>';
		});
		
		const container = document.getElementById("container");
		container.innerHTML = accordion;
		
		let acc = document.getElementsByClassName("accordion");
		for (let i = 0; i < acc.length; i++) 
		{
			acc[i].addEventListener("click", function() 
			{	
				ClickActions(acc[i]);			
			});
		}
			
		LoadScreen(false);
	}
	
	function ClickActions(e)
	{		
		if(!e.className.includes("finalFolder"))
		{			
			let panel = e.nextSibling;
			if(!panel.className.includes("listening"))
			{
				panel.classList.add("listening");
				panel.addEventListener("click", function()
				{					
					ClickActions(panel);
				});
			}
			if (panel.style.display === "block") 
			{
			  panel.style.display = "none";
			} else 
			{
			  panel.style.display = "block";
			}
		}
	}	
	
	function GetChildData()
	{
		console.log("GetChildData");		
		parentList.forEach(i=> {			
			GetFolderData(i.id);
		});						
	}
	
	function GetFolderData(id)
	{
		console.log('GetAllFolders');
		fetch('https://kromsimagesortingserver.herokuapp.com/ListFolder', 
		{
			method: "POST",	
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			'Accept': 'application/json',	
			body: JSON.stringify({'folderLoc':id})
		})
		.then(response => response.text())
		.then(data => {	
			let files = JSON.parse(data);
			//TODO get child folders
			files.forEach( i=> {
				if(i[".tag"]==="folder")
				{
					childList.push(i);				
				}								
			});			
			
			listCheck++;
			
			if(listCheck>=parentList.length)
				BuildFinalList();	
		})
		.catch((error) => 
		{
			console.error('Error:', error);
		});	
	}	
	
  return (
		  <Modal.Dialog>
			  <Modal.Header closeButton>
				<Modal.Title>Folder Selection</Modal.Title>
			  </Modal.Header>

			  <Modal.Body>
				<div id="container"/>					
			  </Modal.Body>
			  
			  <Modal.Footer>
				<Button variant="secondary">Close</Button>
			  </Modal.Footer>
			</Modal.Dialog>
	);
}