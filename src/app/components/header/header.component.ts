import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import { ThemeService } from 'src/app/shared/services/theme/theme.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements AfterViewInit {
  currentTheme$: Observable<string>;
  currentTheme: string;
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

  logoutObj = {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      this.logout();
    },
  };

  items: MenuItem[] | undefined = [
    this.logoutObj,
    this.stampanteObj,
    this.inventarioObj,
    // this.prodEnv,
    // this.testEnv,
  ];
  constructor(
    private router: Router,
    private authService: AuthService,
    private printService: PrintService,
    private firebaseApp: FirebaseApp,
    private themeService: ThemeService
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

    this.currentTheme$ = this.themeService.theme$;
    this.currentTheme$.subscribe((value) => {
      this.currentTheme = value;
    });
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

  toggleTheme(): void {
    this.themeService.switchTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  get buttonTheme() {
    let baseObject = {
      borderRadius: '0px',
      border: 0,
      'border-style': 'none',
      'border-color': 'transparent',
      background: '',
    };

    if (this.currentTheme === 'theme-dark') {
      baseObject.background = '#1c1917';
    } else {
      baseObject.background = '#0f172a';
    }
    return baseObject;
  }

  get toogleThemeIcon() {
    if (this.currentTheme === 'theme-dark') {
      return 'pi pi-moon';
    } else {
      return 'pi pi-sun';
    }
  }
}
