import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState<string>('sua_tabela');
  const [dml, setDml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [caseTransform, setCaseTransform] = useState<string>('none');
  const [sqlDialect, setSqlDialect] = useState<string>('postgresql');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo CSV.');
      return;
    }

    setLoading(true);
    setError('');
    setDml('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          table_name: tableName,
          case_transform: caseTransform,
          sql_dialect: sqlDialect,
        }
      });
      setDml(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Conversor de CSV para DML
          </Typography>
          <Typography variant="subtitle1">
            Uma ferramenta poderosa para transformar dados CSV em SQL com facilidade.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <Typography variant="h6">1. Upload do Arquivo CSV</Typography>
              <Button variant="contained" component="label">
                Selecionar Arquivo
                <input type="file" hidden accept=".csv" onChange={handleFileChange} />
              </Button>
              {file && <Typography sx={{ mt: 1, fontStyle: 'italic' }}>{file.name}</Typography>}
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6">2. Configurações de Saída</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome da Tabela"
                    variant="outlined"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Dialeto SQL</InputLabel>
                    <Select
                      value={sqlDialect}
                      label="Dialeto SQL"
                      onChange={(e: SelectChangeEvent) => setSqlDialect(e.target.value)}
                    >
                      <MenuItem value="postgresql">PostgreSQL</MenuItem>
                      <MenuItem value="mysql">MySQL</MenuItem>
                      <MenuItem value="sqlserver">SQL Server</MenuItem>
                      <MenuItem value="oracle">Oracle</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">3. Transformações de Dados</Typography>
              <FormControl fullWidth>
                <InputLabel>Padronização de Texto</InputLabel>
                <Select
                  value={caseTransform}
                  label="Padronização de Texto"
                  onChange={(e: SelectChangeEvent) => setCaseTransform(e.target.value)}
                >
                  <MenuItem value="none">Nenhuma</MenuItem>
                  <MenuItem value="uppercase">MAIÚSCULAS</MenuItem>
                  <MenuItem value="lowercase">minúsculas</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Convertendo...' : 'Gerar DML'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

        {dml && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>DML Gerado</Typography>
            <Paper elevation={2} sx={{ p: 2, maxHeight: '400px', overflow: 'auto', backgroundColor: '#f5f5f5' }}>
              <pre><code>{dml}</code></pre>
            </Paper>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigator.clipboard.writeText(dml)}>
              Copiar
            </Button>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
