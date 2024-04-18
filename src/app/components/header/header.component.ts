import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
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

  items: MenuItem[] | undefined = [this.stampanteObj, this.inventarioObj];

  constructor(
    private router: Router,
    private authService: AuthService,
    private printService: PrintService
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
}
