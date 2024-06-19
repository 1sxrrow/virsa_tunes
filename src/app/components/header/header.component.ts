import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import {
  deleteApp,
  FirebaseApp,
  initializeApp,
  provideFirebaseApp
} from '@angular/fire/app';
import { provideDatabase } from '@angular/fire/database';
import { NavigationEnd, Router } from '@angular/router';
import { getDatabase } from 'firebase/database';
import { MenuItem } from 'primeng/api';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import {
  devFirebaseConfig,
  prodFirebaseConfig,
} from 'src/environments/environment';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements AfterViewInit {
  @Output() isSidenavOpen = new EventEmitter<boolean>();
  isSidenavOpenChange = false;
  isLogin = true;
  isRotated = false;
  databaseObj = {
    label: 'Database',
    icon: 'pi pi-database',
    command: () => {
      this.goToDatabase();
    },
  };

  inventarioObj = {
    label: 'Inventario',
    icon: 'pi pi-server',
    command: () => {
      this.goToInventario();
    },
  };

  stampanteObj = {
    label: 'Scegli stampante',
    icon: 'pi pi-print',
    command: () => {
      this.setPrinterDevice();
    },
  };

  testEnv = {
    label: 'Passa a env di test',
    icon: 'pi pi-bolt',
    command: () => {
      this.setTestEnv();
    },
  };

  prodEnv = {
    label: 'Passa a env di Prod',
    icon: 'pi pi-bolt',
    command: () => {
      this.setProdEnv();
    },
  };

  items: MenuItem[] | undefined = [
    this.stampanteObj,
    this.inventarioObj,
    // this.prodEnv,
    // this.testEnv,
  ];
  constructor(
    private router: Router,
    private authService: AuthService,
    private printService: PrintService,
    private firebaseApp: FirebaseApp
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('inventario')) {
          let i = this.items.indexOf(this.databaseObj);
          i <= 0 ? this.items.push(this.databaseObj) : null;
          this.items = this.items.filter((item) => {
            return item.label !== 'Inventario';
          });
        } else if (event.urlAfterRedirects.includes('users')) {
          let i = this.items.indexOf(this.inventarioObj);
          i <= 0 ? this.items.push(this.inventarioObj) : null;
          this.items = this.items.filter((item) => {
            return item.label !== 'Database';
          });
        }
      }
    });

    if (this.showDatabase()) {
      this.items.forEach((item) => {
        item.items?.push({
          label: 'Database',
          icon: 'pi pi-database',
          command: () => {
            this.goToDatabase();
          },
        });
      });
    }
  }

  ngAfterViewInit(): void {
    // Check if route is login
    this.router.events.subscribe((event) => {
      event instanceof NavigationEnd
        ? (this.isLogin =
            event.urlAfterRedirects === '/login'
              ? (this.isLogin = true)
              : false)
        : null;
    });
  }

  goHome() {
    if (this.authService.getUserState()) {
      this.router.navigate(['/']);
    }
  }

  setPrinterDevice() {
    this.printService.chooseDevice();
  }

  goToInventario() {
    this.router.navigate(['inventario']);
  }

  goToDatabase() {
    this.router.navigate(['users']);
  }

  showDatabase() {
    return this.router.url.includes('inventario') ? true : false;
  }

  setTestEnv() {
    deleteApp(this.firebaseApp);
    this.firebaseApp = initializeApp(devFirebaseConfig);
  }

  async setProdEnv() {
    deleteApp(this.firebaseApp).then(() => {
      console.log('App deleted');
      provideFirebaseApp(() => initializeApp(prodFirebaseConfig));
      console.log('App initialized', this.firebaseApp);
      provideDatabase(() => getDatabase());
      this.router.navigate(['login']);
    });
  }
}
