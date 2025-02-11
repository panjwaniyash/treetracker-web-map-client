import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  Avatar,
  useTheme,
} from '@mui/material';
import Portal from '@mui/material/Portal';
import log from 'loglevel';
import Image from 'next/image';
import React, { useEffect } from 'react';
import CustomWorldMap from 'components/CustomWorldMap';
import PlanterQuote from 'components/PlanterQuote';
import TreeSpeciesCard from 'components/TreeSpeciesCard';
import CustomImageWrapper from 'components/common/CustomImageWrapper';
import DrawerTitle from 'components/common/DrawerTitle';
import { useDrawerContext } from 'context/DrawerContext';
import { getOrganizationById, getOrgLinks } from 'models/api';
import { makeStyles } from 'models/makeStyles';
import PageWrapper from '../../components/PageWrapper';
import CustomCard from '../../components/common/CustomCard';
// import placeholder from '../../images/organizationsPlaceholder.png';
import { useMapContext } from '../../mapContext';
import * as utils from '../../models/utils';

const useStyles = makeStyles()((theme) => ({
  imgContainer: {
    borderRadius: '16px',
    position: 'relative',
    img: {
      borderRadius: '16px',
    },
    marginBottom: theme.spacing(4),
    '&> img': {
      width: '100%',
      height: '100%',
    },
  },
  logoContainer: {
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    left: theme.spacing(4),
    bottom: theme.spacing(4),
    boxSizing: 'border-box',
    padding: theme.spacing(5),
    width: 108,
    height: 108,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&> img': {
      width: '100%',
    },
  },
  divider: {
    marginTop: theme.spacing(20),
    marginBottom: theme.spacing(20),
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(14),
      marginBottom: theme.spacing(14),
    },
  },
}));

export default function Organization(props) {
  const { organization, nextExtraIsEmbed } = props;
  const mapContext = useMapContext();
  const { classes } = useStyles();
  const [isPlanterTab, setIsPlanterTab] = React.useState(true);
  // eslint-disable-next-line
  const [continent, setContinent] = React.useState(null);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { setTitlesData } = useDrawerContext();

  async function updateContinent() {
    const tree = organization?.featuredTrees?.trees[0];
    if (tree) {
      const { lat, lon } = tree;
      const newContinent = await utils.getContinent(lat, lon);
      setContinent(newContinent.name);
    }
  }

  useEffect(() => {
    setTitlesData({
      name: organization.map_name,
      createAt: organization.created_time,
    });
  }, [organization.created_time, organization.map_name, setTitlesData]);

  useEffect(() => {
    async function reload() {
      // manipulate the map
      const { map } = mapContext;
      if (map && organization) {
        // map.flyTo(tree.lat, tree.lon, 16);
        map.setFilters({
          map_name: organization.name,
        });
        // TODO why I must try/catche this?
        try {
          await map.loadInitialView();
          map.rerender();
        } catch (e) {
          log.error('rendering map:', e);
        }
      } else {
        log.warn('no data:', map, organization);
      }
    }
    reload();

    updateContinent();
    // eslint-disable-next-line
  }, [mapContext, organization]);

  return (
    <>
      <PageWrapper>
        {!isMobileScreen && <DrawerTitle />}

        {!isMobileScreen && (
          <Divider variant="fullWidth" sx={{ mt: 7, mb: 13.75 }} />
        )}
        <Box
          className={classes.imgContainer}
          sx={{
            width: '100%',
            height: '688px',
            borderRadius: 6,
            mt: 11,
            mb: [6, 10],
          }}
        >
          {/* Placeholder image, change it if we get data from API */}
          <Image
            src="https://treetracker-production-images.s3.eu-central-1.amazonaws.com/2019.11.08.11.12.43_1a507e4a-ade7-47d7-b7f5-e1a425588483_IMG_20191030_173914_4000805348046989577.jpg"
            alt="some text"
            layout="fill"
          />
          <Box className={classes.logoContainer}>
            {/* Replace url with API data  */}
            {/*  <Image src={organization.logo_url} /> */}
          </Box>
        </Box>
        <Grid
          container
          wrap="nowrap"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Grid item sx={{ width: '49%' }}>
            <CustomCard
              handleClick={() => setIsPlanterTab(true)}
              icon={<ParkOutlinedIcon fontSize="large" />}
              title="Trees Planted"
              text={organization?.featuredTrees?.trees.length}
              disabled={!isPlanterTab}
            />
          </Grid>
          <Grid item sx={{ width: '49%' }}>
            <CustomCard
              handleClick={() => setIsPlanterTab(false)}
              icon={<PersonOutlineIcon fontSize="large" />}
              title="Hired Planters"
              text={organization?.associatedPlanters?.planters.length}
              disabled={isPlanterTab}
            />
          </Grid>
        </Grid>
        {isPlanterTab && (
          <>
            <Box sx={{ mt: [0, 22] }}>
              <CustomWorldMap
                totalTrees={organization?.featuredTrees?.trees.length}
                con="af"
              />
            </Box>
            <Box className={classes.speciesBox}>
              {organization?.species.species.map((species) => (
                <TreeSpeciesCard
                  key={species.id}
                  name={species.name}
                  count={species.total}
                />
              ))}
            </Box>
          </>
        )}
        {!isPlanterTab && (
          <Stack spacing={{ xs: 37.5, sm: 14 }} mt={{ xs: 13, sm: 22 }}>
            {/* {organization?.associatedPlanters?.planters?.map((planter) => (
            <PlanterQuote
              name={planter.first_name}
              key={planter.id}
              quote={planter.about.slice(0, 150)}
              photo={planter.photo_url}
              initialDate={planter.created_time}
              location={planter.country}
            />
          ))} */}
            {/* Placeholder quote card, remove after API gets data */}
            <PlanterQuote
              name="Jirgna O"
              quote="Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa iusto
                nesciunt quasi praesentium non cupiditate ratione nihil. Perferendis,
                velit ipsa illo, odit unde atque doloribus tempora distinctio facere
                dolorem expedita error."
              photo="https://treetracker-production.nyc3.digitaloceanspaces.com/2019.07.10.18.32.42_b4fad89a-10b6-40cc-a134-0085d0e581d2_IMG_20190710_183201_8089920786231467340.jpg"
              initialDate={2022}
              location="Shiramtunda, Tanzania"
            />
            <PlanterQuote
              name="Samwell A"
              quote="Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa iusto
                nesciunt quasi praesentium non cupiditate ratione nihil. Perferendis,
                velit ipsa illo, odit unde atque doloribus tempora distinctio facere
                dolorem expedita error."
              photo="https://treetracker-production.nyc3.digitaloceanspaces.com/2018.11.20.12.11.07_e7a81cf4-2d37-45ee-9d5a-47bdfd7c43cc_IMG_20181120_121037_7990135604649410080.jpg"
              initialDate={2022}
              location="Addis Ababa, Ethiopia"
            />
          </Stack>
        )}
        <Divider varian="fullwidth" className={classes.divider} />
        <Typography variant="h4">About the Organization</Typography>
        <Typography variant="body2" mt={7}>
          {/* Just some placeholder text */}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa iusto
          nesciunt quasi praesentium non cupiditate ratione nihil. Perferendis,
          velit ipsa illo, odit unde atque doloribus tempora distinctio facere
          dolorem expedita error. Natus, provident. Tempore harum repellendus
          reprehenderit vitae temporibus, consequuntur blanditiis officia
          excepturi, natus explicabo laborum delectus repudiandae placeat
          eligendi.
        </Typography>
        <Typography variant="h4" sx={{ mt: { xs: 10, md: 16 } }}>
          Mission
        </Typography>
        <Typography variant="body2" mt={7}>
          {/* Just some placeholder text */}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa iusto
          nesciunt quasi praesentium non cupiditate ratione nihil. Perferendis,
          velit ipsa illo, odit unde atque doloribus tempora distinctio facere
          dolorem expedita error. Natus, provident. Tempore harum repellendus
          reprehenderit vitae temporibus, consequuntur blanditiis officia
          excepturi, natus explicabo laborum delectus repudiandae placeat
          eligendi.
        </Typography>
        <Divider varian="fullwidth" className={classes.divider} />
        <Typography variant="h4" mb={9}>
          Check out the planting effort in action
        </Typography>
        <Box mb={17}>
          {/* Placeholder image and data, should be changed later */}
          <CustomImageWrapper
            imageUrl="https://treetracker-dev.nyc3.digitaloceanspaces.com/2018.09.07.11.04.27_3ae160d9-58f7-4373-a4c2-3b39edbacd2e_IMG_20180907_095704_764193446.jpg"
            timeCreated={2022}
            treeId={940}
          />
        </Box>
      </PageWrapper>
      {nextExtraIsEmbed && (
        <Portal container={document.getElementById('embed-logo-container')}>
          <Avatar
            sx={{
              width: '120px',
              height: '120px',
              margin: '10px',
            }}
            src={organization.image_url}
            variant="rounded"
          />
        </Portal>
      )}
    </>
  );
}

export async function getServerSideProps({ params }) {
  const id = params.organizationid;
  const organization = await getOrganizationById(id);
  const orgLinks = await getOrgLinks(organization.links);
  return {
    props: {
      organization: {
        ...organization,
        ...orgLinks,
      },
    },
  };
}
