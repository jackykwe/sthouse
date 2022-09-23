import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";

const takingTooLongText = "Whoa, that's taking a while.";
const takingTooLongText2 = "You may want to try refreshing the page.";

interface TakingTooLongCollapseProps {
  show: boolean;
}

export const TakingTooLongCollapse = (props: TakingTooLongCollapseProps) => {
  const { show } = props;
  return (
    <Collapse in={show}>
      <>
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Typography variant="body2" align="center" lineHeight={1}>
            {takingTooLongText} {takingTooLongText2}
          </Typography>
        </Box>
        <Box
          sx={{
            display: {
              xs: "flex",
              md: "none",
              flexDirection: "column",
            },
          }}
        >
          <Typography variant="body2" align="center" lineHeight={1}>
            {takingTooLongText}
          </Typography>
          <Typography variant="body2" align="center" lineHeight={1}>
            {takingTooLongText2}
          </Typography>
        </Box>
      </>
    </Collapse>
  );
};
