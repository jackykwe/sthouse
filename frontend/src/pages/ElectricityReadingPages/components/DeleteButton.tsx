import Button from "@mui/material/Button";

interface DeleteButtonProps {
  fullWidth: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const DeleteButton = (props: DeleteButtonProps) => {
  const { fullWidth, onClick } = props;
  return (
    <Button
      fullWidth={fullWidth}
      disableElevation
      onClick={onClick}
      variant="contained"
      color="secondary"
      sx={{ height: 56 }}
    >
      Delete
    </Button>
  );
};
