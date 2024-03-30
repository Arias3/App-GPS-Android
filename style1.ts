import { StyleSheet } from 'react-native';

const style1 = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  container: {
    flex: 20,
    padding: 30,
  },
  title: {
    fontFamily: 'Batangas-Regular',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: 'Batangas-Regular',
  },
  value: {
    fontSize: 20,
  },

  stretch: {
    width: 225,
    height: 200,
    marginLeft: -10,
    resizeMode: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    marginTop: 0,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: 'rgb(8,27,42)',
    fontSize: 18,
    fontWeight: 'bold',
  },

  buttonText: {
    fontSize: 50,
    fontFamily: 'batangas-regular',
    fontWeight: 'bold',
    color: 'white',
  },
});

const style2 = StyleSheet.create({
  container: {
    padding: 8,
    flex: 4,
  },

  content: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },

  title: {
    fontFamily: 'Batangas-Regular',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },

  dataRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },

  value: {
    fontSize: 18,
  },

  stretch: {
    width: 225,
    height: 40,
    resizeMode: 'center',
  }
});

const style3 = StyleSheet.create({
  content: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },

  container: {
    color: 'black',
    backgroundColor: 'rgb(191, 210, 224)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 70,
    alignItems: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },

  title: {
    fontFamily: 'Batangas-Regular',
    fontSize: 30,
    color: 'rgb(8,27,42)',
    fontWeight: 'bold',
    marginBottom: 8,
    alignItems: 'center',
  },

  dataRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },

  label: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'rgb(8,27,42)',
    marginRight: 4,
    marginBottom: 5,
    marginLeft: 4,
    fontFamily: 'Batangas-Regular',
    alignItems: 'center',
  },

  stretch: {
    width: 100,
    height: 100,
    resizeMode: 'stretch',
    alignItems: 'center',
    marginLeft: 82,
    marginBottom: 10,

  },
  buttonContainer: {
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(8,27,42)',
    fontSize: 18,
    fontWeight: 'bold',
    width: '100%',
    marginTop: 10,
  },
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export { style1, style2, style3, styles };


