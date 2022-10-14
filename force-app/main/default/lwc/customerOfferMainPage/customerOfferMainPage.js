import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import offers from '@salesforce/apex/customerOfferPageController.getOffers';
import getIDFromURL from '@salesforce/apex/customerOfferPageController.getIDFromURL';
import FORM_FACTOR from '@salesforce/client/formFactor'


export default class CustomerOfferMainPage extends LightningElement
{
	encryptedID;
	decryptedID;
	pageIsExpired = false;
	allOffers = [];
	allOfferGroups = [];

	mobileRender;

	renderedCallback()
	{
		//remove the last <hr> element
		var hrNodes = this.template.querySelectorAll("hr");
		hrNodes[hrNodes.length - 1].remove();

		//Determine if device is mobile
		this.mobileRender = (FORM_FACTOR === 'Small' || FORM_FACTOR === 'Medium') ? true : false;
		console.log('Mobile render from customOfferMainPage: ' + this.mobileRender);
	}

	@wire(CurrentPageReference)
	getStateParameters(currentPageReference)
	{
		if (currentPageReference.state.c__OpportunityIdentifier)
		{
			this.encryptedID = currentPageReference.state.c__OpportunityIdentifier;
			console.log(this.encryptedID);
		}
		else
			console.log('No url parameter found.')
	}

	@wire (getIDFromURL, { urlParam: '$encryptedID' })
	setOpportunityID(result)
	{
		if(result.data)
		{
			this.decryptedID = result.data;
			console.log(this.decryptedID);
			this.pageIsExpired = (result.data === 'expired' ? true : false);
		}
		
		if (result.error)
			console.error(result.error);
	}

	@wire (offers, { OpportunityID: '$decryptedID' })
	offersList(result)
	{
		if (result.data)
			{
				this.allOffers = result.data
				console.log('result.data ', result.data)
				this.allOfferGroups = Object.entries(this.groupByOffer(result.data)).map(([key, value]) => ({ key, value }))
				console.log('this.allOfferGroups ', this.allOfferGroups)
			}
		if (result.error)
			console.error(result.error);
	}

	groupByOffer(offersArray)
	{
		let  returnObject = {};

		for (const offer of offersArray)
		{
			if (!(offer.McaApp__Deal_Type__c in returnObject))
				returnObject[offer.McaApp__Deal_Type__c] = []
			returnObject[offer.McaApp__Deal_Type__c].push(offer)
		}

		return returnObject
	}
}