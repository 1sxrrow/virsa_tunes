import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
})
export class CustomSelectComponent {
  @Input() options: { value: string; label: string }[] = [];
  @Input() label: string = '';
  @Output() selectionChange = new EventEmitter<string>();

  protected selectElement: string;

  onSelectionChange(event: Event) {
    const HTMLSelectElement = event.target as HTMLSelectElement;
    this.selectElement = HTMLSelectElement.value;
    this.selectionChange.emit(this.selectElement);
  }

  clearSelectElement() {
    this.selectElement = undefined;
    this.selectionChange.emit(this.selectElement);
  }
}
