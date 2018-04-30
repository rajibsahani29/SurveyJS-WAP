import { Component, OnInit } from '@angular/core';

import { ActiveUser } from './_models/ActiveUser';
import { AuthService } from './_services/auth.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: [],
})

export class AppComponent implements OnInit {
  activeUser: ActiveUser;
  AccessID: string;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.activeUser = new ActiveUser();
    this.initUser()
  }
  
  initUser() {
    //localStorage.setItem('AccessID','\"2cf3900e-120e-49dd-87b1-caa0efeb7d0b\"');
    let accessID = localStorage.getItem("AccessID");
    if (accessID !== null) {
      // add popup here, only fires if the accessID was saved
      accessID = JSON.parse(accessID);
      this.AccessID = accessID;
      this.authService.validateAccessID(accessID).subscribe(
          data => { 
              this.activeUser = data;
              //console.log("response",this.activeUser);
          },
          error => {
            if(error.status == 401) {
              window.location.href ="../#/login";
            }
            else{
              console.log("myerror",error);
            }
          },
          () =>  {
              //console.log("Finished")
          }
      );
    } else {
      // user is not remembered, must log in
      this.resetUser();
      window.location.href ="../#/login";
      //ManageControls(false);
    }
  }

  resetUser() {
    localStorage.clear();
    sessionStorage.clear();
    this.activeUser.isUserAuthorized = false;
    this.activeUser.UserID = null;
    this.AccessID = null;
  }

}
