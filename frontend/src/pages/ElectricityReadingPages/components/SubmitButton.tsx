import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";

interface SubmitButtonProps {
  fullWidth: boolean;
  loading: boolean;
  progress: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const SubmitButton = (props: SubmitButtonProps) => {
  const { fullWidth, loading, progress, onClick } = props;
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
      sx={{ height: 56 }}
    >
      Submit
    </LoadingButton>
  );
};
