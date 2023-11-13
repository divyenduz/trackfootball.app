import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'

interface Props {
  children: React.ReactNode
  title: string
}

export const OnboardingWidget: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="w-full m-2">
      <Card>
        <CardHeader
          title={<Typography variant="body1">{title}</Typography>}
        ></CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
