export default {

  chargeCode: {

    chargeCodeid: "",//db primary key
    chargeCodeName: "",//user assign textfield
    chargeCodeVersion: "",//number alpha numaric
    author: null,//superAdmin creator
    lastModifiedBy: "",//other superdmin 
    lastModifiedDate: "",
    users: [],//ids //userid query chargecode
    admins: [],//ids

    workshops: [],//ids ICAP
    ideas: [],//ideas
    raceProject: [],//ids

    modules: [],//ids
    industry: [],//ids
    application: [],
    products: [],
    company: "",//id
    totalUsers: null,
    totalAdmins: null,
    edName: "",//executive director name
    edMail: "",//ED email
    billingUnit: null,
    billingCurrenacy: null,
    isApproved: false,//approved by ED on email
    isDeleted: false,//soft delete
    chargeCodeStartDate: "",//fixed
    chargeCodeEndDate: ""//super admin can modify and reduce or can increase //track //audit log

  },
  modules: [
    { id: 1, value: "RACE" },//Estimation projects
    { id: 2, value: "I-Base" },//Products//BOMS//
    { id: 3, value: "I-CAP" }, //Workshop,Ideas
    { id: 4, value: "I-Track" },//Ideas
    { id: 5, value: "I-Expert" }
  ],
  industry: [
    {
      id: 1, value: "Automotive", applications: [{ id: 1, value: "Commercial Vehicle" }]
    },
    { id: 2, value: "AeroSpace" },
    { id: 3, value: "Process Industry" },
    { id: 4, value: "Consumer Goods" }

  ],

  applications: [
    { id: 1, industryId: 1, value: "Commercial Vehicle" },
    { id: 2, industryId: 1, value: "2W" },
    { id: 3, industryId: 1, value: "3W" }

  ],

  products: [
    {
      id: 1, applicationid: 2, name: "Hero Honda", Varient: "",
      bom: [
        {
          bomId: "",
          model: {
            attributes: [{
              Mileage: "80.6 kmpl",
              Engine_Displ: "97.2 cc",
              Brakes_Front: "Drum",
              Power: "8.36 PS @8000 rpmKerb ",
              Weight: "113 kg",
              Starting: "Kick and Self Start",
              wheels_Type: "Alloy",
              tyre_Type: "Tubeless",
              digital_Fuel_Indicator: "noStandard",
              Warranty_Years: "NA"

            }],
            aggregate: [{
              name: "trasnmission",


              sub_aggregate: [{

                part: [
                  {

                  }]

              }]
            }],


          }
        }

      ]


    },
    { id: 2, applicationid: 2, name: "TVS Appache", Varient: "", BOMId: "" },
    { id: 3, applicationid: 2, name: "Yamaha RX120 ", Varient: "", BOMId: "" }
  ],

  company: [

    {
      Id: "1",
      name: "kalsoft",
      address: "Pune",
      edName: "Promod Kalyani",
      edEmail: "promod.kalyani@gmail.com",
      gstNo: ""
    }
  ]
  //
}
