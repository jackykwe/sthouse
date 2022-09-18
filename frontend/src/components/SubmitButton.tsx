import LoadingButton from "@mui/lab/LoadingButton";
import { SxProps, Theme } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface SubmitButtonProps {
  fullWidth: boolean;
  loading: boolean;
  progress: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  sx?: SxProps<Theme>;
}

export const SubmitButton = (props: SubmitButtonProps) => {
  const { fullWidth, loading, progress, onClick, sx } = props;
  return (
    <LoadingButton
      fullWidth={fullWidth}
      loading={loading}
      loadingIndicator={
        progress < 100 ? (
          <CircularProgress variant="determinate" value={progress} />
        ) : (
          <CircularProgress />
        )
      }
      disableElevation
      onClick={onClick}
      variant="contained"
      color="primary"
      sx={{ height: 56, ...sx }}
    >
      Submit
    </LoadingButton>
  );
};
