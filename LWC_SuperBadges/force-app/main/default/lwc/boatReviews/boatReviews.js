import { LightningElement,api } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';


export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;
    boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    get recordId() { 
        return this.boatId;
    }

    @api
    set recordId(value) {
       this.setAttribute('boatId',value);
       this.boatId=value;
       this.getReviews();
    
      //get reviews associated with boatId
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() { 
        if(this.boatReviews!=null && this.boatReviews!=undefined && this.boatReviews.length>0){
            return true;
        }else{
            return false;
        }
    }
    
    // Public method to force a refresh of the reviews invoking getReviews
     @api refresh() {
        console.log('inside refresh..');
        refreshApex(this.getReviews());
     }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() { 
        console.log('boatId valuuuueee==>',this.boatId);
        if(this.boatId){
        this.isLoading=true;
        getAllReviews({boatId:this.boatId})
        .then(result => {
            console.log('review results=>',result);
            this.boatReviews = result;
        }).catch(error => {
            this.error = error;
        }).finally(() => {
            this.isLoading = false;
        });
    }else{
        return;
    }


    }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) { 
        //event.preventDefault();
       // event.stopPropagation();
        let recordId = event.target.dataset.recordId;
        console.log('user recordId=>',recordId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: "User",
                actionName: "view"
            },
        });

     }
  }
  