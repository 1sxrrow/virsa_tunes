import { Component, Input } from '@angular/core';
import { SpecificDataModel } from 'src/app/shared/specific_data.model';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent {
  @Input() specificData: SpecificDataModel;
}
