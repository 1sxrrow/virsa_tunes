import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { selectEventEmitterObject } from 'src/app/shared/types/custom-types';

@Component({
  selector: 'virsa-select',
  templateUrl: './custom-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor, OnInit {
  @Input() isDisabled: boolean = false;
  @Input() label: string;
  @Input() specificName: string;
  @Input() formControlName: string;
  @Input() group: FormGroup;
  @Input() control: FormControl;
  @Input() dataSet: { value: string; label: string }[];
  @Output() selectionChange = new EventEmitter<selectEventEmitterObject>();

  @Input() set externalValue(value: string) {
    this.writeValue(value);
  }

  protected selectElement: string;
  protected internalValue: string;

  ngOnInit(): void {
    if (this.isDisabled) {
      const control = this.group.get(this.formControlName);
      if (control) {
        control.disable();
      }
    }
  }

  private onChange: (value: any) => void;
  private onTouched: () => void;

  writeValue(value: any): void {
    if (this.internalValue !== value) {
      this.selectElement = value;
      this.internalValue = value;
      if (this.onChange) {
        this.onChange(value);
        const control = this.group.get(this.formControlName);
        if (control) {
          control.setValue(value, { emitEvent: false });
        }
      }
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // this.isDisabled = isDisabled;
  }

  onSelectionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectElement = value;
    this.internalValue = value;
    if (this.onChange) {
      this.onChange(value);
    }
    if (this.onTouched) {
      this.onTouched();
    }
    this.selectionChange.emit({
      value,
      formControlName: this.formControlName || '',
    });
  }

  clearSelectElement(): void {
    this.selectElement = null;
    this.internalValue = null;
    if (this.onChange) {
      this.onChange(null);
    }
    this.selectionChange.emit({
      value: null,
      formControlName: this.formControlName,
    });
  }
}
