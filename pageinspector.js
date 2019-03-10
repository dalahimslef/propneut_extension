function propneut_inspectPage(){   
	var pageinfo=new Object;
	pageinfo.title=propneut_getTitle();
	pageinfo.header=propneut_getHeader();
	pageinfo.elemntinfo=propneut_getElements();
	pageinfo.textidentifier=propneut_getPageTextIdent();      
	return pageinfo;
}

function propneut_getPageTextIdent(){
	//jQuery('body').html('<div>rwefgyj</div>');
	var allDivs=jQuery('div');
	var ndx;
	var ndx2;
	var ndx3;
	var divText;
	var longestText='';
	var longestDiv=-1;
	var childNodes;
	var clonedDiv;
	var textNodes;
	var nodeContent;
	for(ndx=0; ndx<allDivs.length; ndx++){
		clonedDiv=jQuery(allDivs[ndx]).clone();
		try{
			nodeContent=jQuery(clonedDiv).contents();
			textNodes=jQuery(nodeContent).filter(function() { return this.nodeType == 3; });
			divText='';
			for(ndx2=0;ndx2<textNodes.length;ndx2++){
				divText=divText+jQuery(textNodes[ndx2]).text();
			}
		}
		catch(err) {
			console.log(err.message);
		}
		//jQuery(clonedDiv).find(':hidden').remove();
		jQuery(clonedDiv).find('div').remove();
		jQuery(clonedDiv).find('script').remove();
		childNodes=jQuery(clonedDiv).find('*');
		for(ndx3=0;ndx3<childNodes.length;ndx3++){
			try{
				nodeContent=jQuery(childNodes[ndx3]).contents();
				textNodes=jQuery(nodeContent).filter(function() { return this.nodeType == 3; });
				for(ndx2=0;ndx2<textNodes.length;ndx2++){
					divText=divText+jQuery(textNodes[ndx2]).text();
				}
			}
			catch(err) {
				console.log(err.message);
			}
		}
		divText=divText.replace(/\W/g, '');
		if(divText.length>longestText.length){
			longestText=divText;
			longestDiv=ndx;
		}
	}
	//console.log(longestText);
	var ident=propneut_getTextIdent(longestText);
	ident=ident.replace('"','');
	return ident;
}

function propneut_getTextIdent(text){
	var identLength=20;
	var indexStep=text.length/identLength;
	var ndx;
	var stringIndex;
	var textIdent='';
	for(ndx=1; ndx<=identLength; ndx++){
		stringIndex=ndx*indexStep;
		stringIndex=Math.floor(stringIndex);
		textIdent=textIdent+text.charAt(stringIndex);
	}
	return textIdent;
}

function propneut_getElements(){
	var elementList=new Array();
	var elementIndex=0;
	var ndx;
	var foundElements=jQuery('img');
	for(ndx=0; ndx<foundElements.length; ndx++){
		elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
		elementIndex++;
	}
	var foundElements=jQuery('iframe');
	for(ndx=0; ndx<foundElements.length; ndx++){
		elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
		elementIndex++;
	}
	var foundElements=jQuery('object');
	for(ndx=0; ndx<foundElements.length; ndx++){
		elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
		elementIndex++;
	}
	var foundElements=jQuery('embed');
	for(ndx=0; ndx<foundElements.length; ndx++){
		elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
		elementIndex++;
	}
	return elementList;
}

function propneut_getElementProperties(element){
	var offset=jQuery(element).offset();
	var width=jQuery(element).width();
	var height=jQuery(element).height();
	var left=offset.left;
	var top=offset.top;
	var elementProperties=new Object();
	elementProperties.width=width;
	elementProperties.height=height;
	elementProperties.left=left;
	elementProperties.top=top;
	return elementProperties;
}

function propneut_getTitle(){
	var title='';
	var allTitles=jQuery('title');
	if (typeof allTitles[0] !== 'undefined') {
		title=jQuery(allTitles[0]).text();
	}
	title=title.replace(/(?:\r\n|\r|\n)/g, '');
	title=title.replace(/\s{2,}/g, ' ');
	return title;
}

function propneut_getHeader(){
	var header='';
	var allHeaders=jQuery('h1');
	if (typeof allHeaders[0] !== 'undefined') {
		header=jQuery(allHeaders[0]).text();
	}
	header=header.replace(/(?:\r\n|\r|\n)/g, '');
	header=header.replace(/\s{2,}/g, ' ');
	return header;
}