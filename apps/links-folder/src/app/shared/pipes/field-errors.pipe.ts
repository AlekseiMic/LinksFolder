import { Pipe, PipeTransform } from '@angular/core';

const errors: Record<string, (error?: any) => string> = {
  required: () => 'Field is required',
  minlength: (error: any) => `Min length is ${error.requiredLength}`,
};

@Pipe({
  name: 'fieldError',
})
export class FieldErrorsPipe implements PipeTransform {
  transform([name, error]: [string, any], ...args: any[]) {
    if (!errors[name]) return name;
    return errors[name](error);
  }
}
