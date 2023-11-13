import MaterialButton, { ButtonProps } from '@mui/material/Button'

export const Button = (props: ButtonProps) => {
  return (
    <MaterialButton
      size="medium"
      variant={props.variant === 'contained' ? 'contained' : 'text'}
      disableElevation
      color="secondary"
      {...props}
    ></MaterialButton>
  )
}

export default Button
