public with sharing class BoatDataService {
    public BoatDataService() {

    }
    
	@AuraEnabled(cacheable=true)
    public static  List<BoatType__c> getBoatTypes(String boatTypeId){
        List<BoatType__c> lstboatTypes=new List<BoatType__c>();
        String query='Select Id,name from BoatType__c ';
        if(String.isBlank(boatTypeId)){
            lstboatTypes=Database.query(query);
        }else{
           query+='where Id:='+boatTypeId;
           lstboatTypes=Database.query(query);
        }
	    return lstboatTypes;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static  List<Boat__c> getBoats(String boatTypeId){
        List<Boat__c> lstboats=new List<Boat__c>();
        String query='Select Id,name,BoatType__c,BoatType__r.Name,Contact__c,Contact__r.Name,Boat_Image__c,Description__c,Geolocation__c,Length__c,Picture__c,Price__c,Year_Built__c from Boat__c ';
        if(String.isBlank(boatTypeId)){
            lstboats=Database.query(query);
        }else{
           query+='where BoatType__c='+ '\''+boatTypeId+'\'';
           lstboats=Database.query(query);
        }
	    return lstboats;

    }
    
    @AuraEnabled
    public static String updateBoatList(Object data){
        List<Boat__c> updatedRecord=(List<Boat__c>) JSON.deserialize(
            JSON.serialize(data),
            List<Boat__c>.class
        );
        System.debug('Data from LWC=>'+updatedRecord);
            try{
                update updatedRecord;
                return 'Success: Boats updated successfully.';
            }catch(Exception ex){
                return 'The following exception has occurred:'+ex.getMessage();
            } 
                
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoatsByLocation(Decimal latitude, Decimal longitude, String boatTypeId){
        
        String query='Select Id,name,Geolocation__c,Geolocation__latitude__s,Geolocation__longitude__s from Boat__c ';
        if(String.isnotBlank(boatTypeId)){
            query+='where BoatType__c='+'\''+boatTypeId+'\'';
        }
        query+='WITH SECURITY_ENFORCED ORDER BY DISTANCE(Geolocation__c, GEOLOCATION(:latitude, :longitude), \'mi\') LIMIT 10';
        System.debug('location query:'+query);
        return database.query(query);
    }
}