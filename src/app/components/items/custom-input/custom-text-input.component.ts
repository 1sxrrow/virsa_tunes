import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { InputType } from './inputType';

@Component({
  selector: 'virsa-text-input',
  templateUrl: 'custom-text-input.component.html',
  styleUrls: ['custom-text-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomInputComponent implements OnInit, ControlValueAccessor {
  @Input('type') type: string = 'text';
  @Input() required: boolean = false;
  @Input() label: string;
  @Input() formControlName: string;
  formControl!: FormControl;
  onTouched: any;
  onChange: any;

  ngOnInit(): void {
    const validators: ValidatorFn[] = [];

    if (this.required) {
      validators.push(Validators.required);
    }

    this.formControl = new FormControl('', validators);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.formControl.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.formControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.formControl.disable() : this.formControl.enable();
  }
}
