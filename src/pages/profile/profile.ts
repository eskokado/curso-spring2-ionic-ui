import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageService } from '../../services/storeage.service';
import { ClienteDTO } from '../../models/cliente.dto';
import { ClienteService } from '../../services/domain/cliente.service';
import { API_CONFIG } from '../../config/api.config';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DomSanitizer } from '@angular/platform-browser';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  cliente: ClienteDTO;
  picture: string;
  // image: any = null;
  profileImage;
  cameraOn: boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public storage: StorageService,
    public clienteService: ClienteService,
    public camera: Camera,
    public sanitizer: DomSanitizer
  ) {
    this.profileImage = 'assets/imgs/avatar-blank.png';
  }

  ionViewDidLoad() {
    this.loadData();
  }

  loadData() {
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      this.clienteService.findByEmail(localUser.email)
        .subscribe(response => {
          this.cliente = response as ClienteDTO;
          this.getImageIfExists();
        },
        error => {
          console.log('erro loadData : ' + error);
          if (error.status == 403) {
            this.navCtrl.setRoot('HomePage');
          }
        });
    }
    else {
      this.navCtrl.setRoot('HomePage');
    }
  }


  getImageIfExists() {
    this.clienteService.getImageFromBucket(this.cliente.id)
      .subscribe(response => {
        this.cliente.imageUrl = `${API_CONFIG.bucketBaseUrl}/cp${this.cliente.id}.jpg`;
        this.blobToDataURL(response).then(dataUrl => {
          let str : string = dataUrl as string
          this.profileImage = this.sanitizer.bypassSecurityTrustUrl(str);
        })
        .catch(error => {
          console.log('erro getImageIfExists catch : ' + error);
        });
      },
      error => {
        console.log('erro getImageIfExists : ' + error);
        this.profileImage = 'assets/imgs/avatar-blank.png';
      });
  }

  blobToDataURL(blob) {
    return new Promise((fulfill, reject) => {
      let reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => fulfill(reader.result);
      reader.readAsDataURL(blob);
    })
    .catch(error => {
      console.log('erro blobToDataURL catch : ' + error);
    });
  }

  getCameraPicture() {

    this.cameraOn = true;
    
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }
  
    this.camera.getPicture(options).then((imageData) => {
     this.picture = 'data:image/png;base64,' + imageData;
     //this.image = this.sn.bypassSecurityTrustResourceUrl(this.picture);
     this.cameraOn = false;
    }, (error) => {
      console.log('erro getCameraPicture : ' + error);
      
      this.cameraOn = false;
    })
    .catch(error => {
      console.log('erro getCameraPicture catch : ' + error);
      this.cameraOn = false;
    });
  }

  getGalleryPicture() {

    this.cameraOn = true;
    
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }
  
    this.camera.getPicture(options).then((imageData) => {
     this.picture = 'data:image/png;base64,' + imageData;
     //this.image = this.sn.bypassSecurityTrustResourceUrl(this.picture);
     this.cameraOn = false;
    }, (error) => {
      console.log('erro getGalleryPicture : ' + error);

      this.cameraOn = false;    
    })
    .catch(error => {
      console.log('erro getGalleryPicture catch : ' + error);
      this.cameraOn = false;
    });
  }

  sendPicture() {
    this.clienteService.uploadPicture(this.picture)
      .subscribe(response => {
        this.picture = null;
        //this.loadData();
        this.getImageIfExists();
      },
      error => {
        console.log(error);
      });
  }

  cancel() {
    this.picture = null;
  }  
}
