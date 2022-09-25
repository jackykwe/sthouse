import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";

const takingTooLongText = "Whoa, that's taking a while.";
const takingTooLongText2 = "You may want to try refreshing the page,";
const takingTooLongText3 = "or clearing this site's cookies.";

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
            {takingTooLongText} {takingTooLongText2} {takingTooLongText3}
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
          <Typography variant="body2" align="center" lineHeight={1}>
            {takingTooLongText3}
          </Typography>
        </Box>
      </>
    </Collapse>
  );
};
