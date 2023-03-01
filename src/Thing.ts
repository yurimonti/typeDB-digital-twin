export class ThingDTOClass{
    private _thingId : string;
    private _attributes : any;
    private _futures: any;

    constructor(thingid:string,attributes:any,futures:any){
        this._thingId = thingid;
        this._attributes=attributes;
        this._futures = futures;
    }

    
    public get thingId() : string {
        return this._thingId;
    }

    
    public get attributes() : any {
        return this._attributes;
    }

    
    public get futures() : any {
        return this._futures;
    }
    
    
    
}